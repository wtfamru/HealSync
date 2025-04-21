// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OrganTransplant is Ownable {
    constructor() Ownable(msg.sender) {}

    struct Hospital {
        uint256 id;
        string name;
    }

    struct MedicalInfo {
        string bloodGroup;
        string organ;
        string ipfsHash;
        string tissueType;
        uint256 hlaMatch;
    }

    struct Donor {
        uint256 id;
        string name;
        string gender;
        uint256 age;
        MedicalInfo medical;
        bool isApproved;
        bool isAvailable;
    }

    struct Recipient {
        uint256 id;
        string name;
        string gender;
        uint256 age;
        MedicalInfo medical;
        uint256 priority;
        bool isApproved;
        bool isWaiting;
        uint256 waitingTime;
    }

    mapping(uint256 => Hospital) public hospitals;
    mapping(uint256 => Donor) public donors;
    mapping(uint256 => Recipient) public recipients;
    uint256 public hospitalCounter;
    uint256 public donorCounter;
    uint256 public recipientCounter;

    event HospitalRegistered(uint256 indexed hospitalId, string name);
    event DonorRegistered(uint256 indexed donorId, string name);
    event DonorApproved(uint256 indexed donorId);
    event RecipientRegistered(uint256 indexed recipientId, string name);
    event RecipientApproved(uint256 indexed recipientId);
    event TransplantSuccessful(uint256 indexed donorId, uint256 indexed recipientId);

    function registerHospital(string memory _name) public {
        require(bytes(_name).length > 0, "Hospital name cannot be empty");
        hospitalCounter++;
        hospitals[hospitalCounter] = Hospital(hospitalCounter, _name);
        emit HospitalRegistered(hospitalCounter, _name);
    }
    
    function validateOrgan(string memory _organ) internal pure returns (bool) {
        string[6] memory validOrgans = ["Heart", "Lung", "Liver", "Kidney", "Pancreas", "Eyes"];
        for (uint i = 0; i < validOrgans.length; i++) {
            if (keccak256(abi.encodePacked(_organ)) == keccak256(abi.encodePacked(validOrgans[i]))) {
                return true;
            }
        }
        return false;
    } 

    function validateBloodGroup(string memory _bloodGroup) internal pure returns (bool) {
        string[8] memory validBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
        for (uint i = 0; i < validBloodGroups.length; i++) {
            if (keccak256(abi.encodePacked(_bloodGroup)) == keccak256(abi.encodePacked(validBloodGroups[i]))) {
                return true;
            }
        }
        return false;
    }

    function registerDonor(
        string memory _name,
        string memory _gender,
        uint256 _age,
        string memory _bloodGroup,
        string memory _organ,
        string memory _ipfsHash,
        uint256 _tissueType,
        uint256 _hlaMatch
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0, "Age must be greater than zero");
        require(validateBloodGroup(_bloodGroup), "Invalid blood group");
        require(validateOrgan(_organ), "Invalid organ type");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_tissueType > 0, "Tissue type must be greater than zero");
        require(_hlaMatch > 0, "HLA match must be greater than zero");
        
        donorCounter++;
        donors[donorCounter] = Donor({
            id: donorCounter,
            name: _name,
            gender: _gender,
            age: _age,
            medical: MedicalInfo({
                bloodGroup: _bloodGroup,
                organ: _organ,
                ipfsHash: _ipfsHash,
                tissueType: _tissueType,
                hlaMatch: _hlaMatch
            }),
            isApproved: false,
            isAvailable: true
        });
        emit DonorRegistered(donorCounter, _name);
    }

    function registerRecipient(
        string memory _name,
        string memory _gender,
        uint256 _age,
        string memory _bloodGroup,
        string memory _organ,
        string memory _ipfsHash,
        uint256 _priority,
        uint256 _tissueType,
        uint256 _hlaMatch
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0, "Age must be greater than zero");
        require(validateBloodGroup(_bloodGroup), "Invalid blood group");
        require(validateOrgan(_organ), "Invalid organ type");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_priority >= 0, "Priority must be zero or positive");
        require(_tissueType > 0, "Tissue type must be greater than zero");
        require(_hlaMatch > 0, "HLA match must be greater than zero");
        
        recipientCounter++;
        
        recipients[recipientCounter] = Recipient({
            id: recipientCounter,
            name: _name,
            gender: _gender,
            age: _age,
            medical: MedicalInfo({
                bloodGroup: _bloodGroup,
                organ: _organ,
                ipfsHash: _ipfsHash,
                tissueType: _tissueType,
                hlaMatch: _hlaMatch
            }),
            priority: _priority,
            isApproved: false,
            isWaiting: true,
            waitingTime: block.timestamp
        });
        emit RecipientRegistered(recipientCounter, _name);
    }

    function approveDonor(uint256 _donorId) public onlyOwner {
        require(_donorId > 0 && _donorId <= donorCounter, "Invalid donor ID");
        require(!donors[_donorId].isApproved, "Donor is already approved");
        
        donors[_donorId].isApproved = true;
        emit DonorApproved(_donorId);
    }

    function approveRecipient(uint256 _recipientId) public onlyOwner {
        require(_recipientId > 0 && _recipientId <= recipientCounter, "Invalid recipient ID");
        require(!recipients[_recipientId].isApproved, "Recipient is already approved");
        
        recipients[_recipientId].isApproved = true;
        emit RecipientApproved(_recipientId);
    }

    function matchRecipient() public {
        uint256 bestRecipient = findBestRecipient();
        
        if (bestRecipient != 0) {
            uint256 bestDonor = findBestDonor(bestRecipient);
            if (bestDonor != 0) {
                performTransplant(bestDonor, bestRecipient);
            }
        }
    }

    function findBestRecipient() private view returns (uint256) {
        uint256 bestRecipient = 0;
        uint256 bestPriority = 0;
        uint256 bestWaitingTime = 0;

        for (uint256 r = 1; r <= recipientCounter; r++) {
            Recipient storage recipient = recipients[r];
            if (recipient.isApproved && recipient.isWaiting) {
                uint256 currentWaiting = block.timestamp - recipient.waitingTime;
                
                if (recipient.priority > bestPriority || 
                    (recipient.priority == bestPriority && currentWaiting > bestWaitingTime)) {
                    bestPriority = recipient.priority;
                    bestWaitingTime = currentWaiting;
                    bestRecipient = r;
                }
            }
        }
        return bestRecipient;
    }

    function findBestDonor(uint256 recipientId) private view returns (uint256) {
        Recipient storage recipient = recipients[recipientId];
        
        for (uint256 d = 1; d <= donorCounter; d++) {
            Donor storage donor = donors[d];
            if (donor.isApproved && donor.isAvailable) {
                if (isCompatible(donor, recipient)) {
                    return d;
                }
            }
        }
        return 0;
    }

    function isCompatible(Donor storage donor, Recipient storage recipient) private view returns (bool) {
        return (keccak256(abi.encodePacked(donor.medical.organ)) == keccak256(abi.encodePacked(recipient.medical.organ)) &&
               keccak256(abi.encodePacked(donor.medical.bloodGroup)) == keccak256(abi.encodePacked(recipient.medical.bloodGroup)) &&
               donor.medical.tissueType == recipient.medical.tissueType &&
               donor.medical.hlaMatch == recipient.medical.hlaMatch);
    }

    function performTransplant(uint256 donorId, uint256 recipientId) private {
        donors[donorId].isAvailable = false;
        recipients[recipientId].isWaiting = false;
        emit TransplantSuccessful(donorId, recipientId);
    }
    
    function renounceOwnership() public pure override {}
}