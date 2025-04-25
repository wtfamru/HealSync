import * as React from "react";

/**
 * A compatibility wrapper to handle React 19's ref changes
 * This helper ensures that refs are correctly passed down to components
 * that may not be fully compatible with React 19's ref handling
 */
export function useCompatRef<T>(originalRef: React.ForwardedRef<T>) {
  const innerRef = React.useRef<T>(null);
  
  React.useEffect(() => {
    if (!originalRef) return;
    
    if (typeof originalRef === 'function') {
      originalRef(innerRef.current);
    } else {
      // In React 19, directly assigning to ref.current is discouraged
      // This is a workaround for older components
      try {
        (originalRef as React.MutableRefObject<T | null>).current = innerRef.current;
      } catch (e) {
        console.warn('React 19 ref compatibility issue:', e);
      }
    }
  }, [originalRef]);
  
  return innerRef;
}

/**
 * Helper HOC to wrap components that might have React 19 ref issues
 */
export function withCompatRef<P extends object, T = any>(
  Component: React.ForwardRefExoticComponent<P & React.RefAttributes<T>>
) {
  return React.forwardRef<T, P>((props, ref) => {
    const compatRef = useCompatRef<T>(ref);
    return <Component {...props} ref={compatRef} />;
  });
} 