// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OrganTransplant is Ownable {
    constructor() Ownable(msg.sender) {}

    struct Hospital {
        uint256 id;
        string name;
        address adminAddress;
    }

    struct MedicalInfo {
        string bloodGroup;
        string organ;
        string tissueType;
        uint256 hlaMatch;
    }

    struct Donor {
        uint256 id;
        string name;
        string gender;
        uint256 age;
        MedicalInfo medical;
        bool isAvailable;
    }

    struct Recipient {
        uint256 id;
        string name;
        string gender;
        uint256 age;
        MedicalInfo medical;
        string urgency; // "Low", "Medium", "High", "Critical"
        bool isWaiting;
        uint256 waitingTime;
    }

    struct Transplant {
        uint256 donorId;
        uint256 recipientId;
        uint256 timestamp;
    }

    struct ConfirmedTransplant {
        uint256 donorId;
        uint256 recipientId;
        uint256 transplantTimestamp;
        uint256 confirmationTimestamp;
        string notes;
    }

    struct MatchResult {
        bool success;
        uint256 donorId;
        uint256 recipientId;
        string message;
    }

    mapping(uint256 => Hospital) public hospitals;
    mapping(uint256 => Donor) public donors;
    mapping(uint256 => Recipient) public recipients;
    mapping(address => bool) public isHospitalAdmin;
    
    Transplant[] public transplants;
    ConfirmedTransplant[] public confirmedTransplants;
    
    uint256 public hospitalCounter;
    uint256 public donorCounter;
    uint256 public recipientCounter;

    event HospitalRegistered(uint256 indexed hospitalId, string name);
    event DonorRegistered(uint256 indexed donorId, string name);
    event RecipientRegistered(uint256 indexed recipientId, string name);
    event TransplantSuccessful(uint256 indexed donorId, uint256 indexed recipientId, uint256 timestamp);
    event TransplantConfirmed(uint256 indexed donorId, uint256 indexed recipientId);
    event MatchAttempt(uint256 indexed recipientId, bool success, string message);

    function registerHospital(string memory _name, address _admin) public onlyOwner {
        require(bytes(_name).length > 0, "Hospital name cannot be empty");
        hospitalCounter++;
        hospitals[hospitalCounter] = Hospital(hospitalCounter, _name, _admin);
        isHospitalAdmin[_admin] = true;
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

    function validateUrgency(string memory _urgency) internal pure returns (bool) {
        bytes32 urgencyHash = keccak256(abi.encodePacked(_urgency));
        return (urgencyHash == keccak256(abi.encodePacked("Low"))) ||
               (urgencyHash == keccak256(abi.encodePacked("Medium"))) ||
               (urgencyHash == keccak256(abi.encodePacked("High"))) ||
               (urgencyHash == keccak256(abi.encodePacked("Critical")));
    }

    function registerDonor(
        string memory _name,
        string memory _gender,
        uint256 _age,
        string memory _bloodGroup,
        string memory _organ,
        string memory _tissueType,
        uint256 _hlaMatch
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0, "Age must be greater than zero");
        require(validateBloodGroup(_bloodGroup), "Invalid blood group");
        require(validateOrgan(_organ), "Invalid organ type");
        require(bytes(_tissueType).length > 0, "Tissue type cannot be empty");
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
                tissueType: _tissueType,
                hlaMatch: _hlaMatch
            }),
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
        string memory _urgency,
        string memory _tissueType,
        uint256 _hlaMatch
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_age > 0, "Age must be greater than zero");
        require(validateBloodGroup(_bloodGroup), "Invalid blood group");
        require(validateOrgan(_organ), "Invalid organ type");
        require(validateUrgency(_urgency), "Invalid urgency level");
        require(bytes(_tissueType).length > 0, "Tissue type cannot be empty");
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
                tissueType: _tissueType,
                hlaMatch: _hlaMatch
            }),
            urgency: _urgency,
            isWaiting: true,
            waitingTime: block.timestamp
        });
        emit RecipientRegistered(recipientCounter, _name);
    }

    function matchRecipient() public returns (MatchResult memory) {
        uint256 bestRecipient = 0;
        uint256 highestUrgencyScore = 0;
        uint256 bestWaitingTime = 0;

        // Find highest priority recipient
        for (uint256 r = 1; r <= recipientCounter; r++) {
            if (recipients[r].isWaiting) {
                uint256 recipientUrgencyScore = getUrgencyScore(recipients[r].urgency);
                uint256 recipientWaitingTime = block.timestamp - recipients[r].waitingTime;

                if (recipientUrgencyScore > highestUrgencyScore ||
                    (recipientUrgencyScore == highestUrgencyScore && recipientWaitingTime > bestWaitingTime)) {
                    highestUrgencyScore = recipientUrgencyScore;
                    bestWaitingTime = recipientWaitingTime;
                    bestRecipient = r;
                }
            }
        }

        if (bestRecipient == 0) {
            emit MatchAttempt(0, false, "No recipients waiting");
            return MatchResult({
                success: false,
                donorId: 0,
                recipientId: 0,
                message: "No recipients waiting"
            });
        }

        // Try to find compatible donor
        for (uint256 d = 1; d <= donorCounter; d++) {
            if (donors[d].isAvailable && isCompatible(donors[d], recipients[bestRecipient])) {
                donors[d].isAvailable = false;
                recipients[bestRecipient].isWaiting = false;
                
                uint256 currentTime = block.timestamp;
                transplants.push(Transplant({
                    donorId: d,
                    recipientId: bestRecipient,
                    timestamp: currentTime
                }));
                
                emit TransplantSuccessful(d, bestRecipient, currentTime);
                emit MatchAttempt(bestRecipient, true, 
                    string(abi.encodePacked("Matched with donor ", donors[d].name)));
                
                return MatchResult({
                    success: true,
                    donorId: d,
                    recipientId: bestRecipient,
                    message: string(abi.encodePacked("Successfully matched with donor ", donors[d].name))
                });
            }
        }

        emit MatchAttempt(bestRecipient, false, "No compatible donor available");
        return MatchResult({
            success: false,
            donorId: 0,
            recipientId: bestRecipient,
            message: "No compatible donor available"
        });
    }

   function confirmTransplant(
    uint256 _donorId,
    uint256 _recipientId,
    string memory _notes
) public {
    // 1. Check if this pair is already confirmed
    for (uint i = 0; i < confirmedTransplants.length; i++) {
        if (confirmedTransplants[i].donorId == _donorId && 
            confirmedTransplants[i].recipientId == _recipientId) {
            revert("Transplant already confirmed");
        }
    }

    // 2. Rest of the logic (find/remove from `transplants`, push to `confirmedTransplants`)
    bool transplantFound = false;
    uint256 transplantTimestamp;
    uint256 indexToRemove;

    for (uint i = 0; i < transplants.length; i++) {
        if (transplants[i].donorId == _donorId && transplants[i].recipientId == _recipientId) {
            transplantFound = true;
            transplantTimestamp = transplants[i].timestamp;
            indexToRemove = i;
            break;
        }
    }
    require(transplantFound, "No matching transplant record found");

    transplants[indexToRemove] = transplants[transplants.length - 1];
    transplants.pop();

    confirmedTransplants.push(ConfirmedTransplant({
        donorId: _donorId,
        recipientId: _recipientId,
        transplantTimestamp: transplantTimestamp,
        confirmationTimestamp: block.timestamp,
        notes: _notes
    }));

    emit TransplantConfirmed(_donorId, _recipientId);
}

    function getUrgencyScore(string memory _urgency) private pure returns (uint256) {
        bytes32 urgencyHash = keccak256(abi.encodePacked(_urgency));
        if (urgencyHash == keccak256(abi.encodePacked("Critical"))) return 4;
        if (urgencyHash == keccak256(abi.encodePacked("High"))) return 3;
        if (urgencyHash == keccak256(abi.encodePacked("Medium"))) return 2;
        if (urgencyHash == keccak256(abi.encodePacked("Low"))) return 1;
        return 0;
    }

    function isCompatible(Donor memory donor, Recipient memory recipient) private pure returns (bool) {
        return keccak256(abi.encodePacked(donor.medical.organ)) == keccak256(abi.encodePacked(recipient.medical.organ)) &&
               keccak256(abi.encodePacked(donor.medical.bloodGroup)) == keccak256(abi.encodePacked(recipient.medical.bloodGroup)) &&
               keccak256(abi.encodePacked(donor.medical.tissueType)) == keccak256(abi.encodePacked(recipient.medical.tissueType)) &&
               donor.medical.hlaMatch == recipient.medical.hlaMatch;
    }

    function getTransplantRecords() public view returns (Transplant[] memory) {
        return transplants;
    }

    function getConfirmedTransplants() public view returns (ConfirmedTransplant[] memory) {
        return confirmedTransplants;
    }

    function renounceOwnership() public view override onlyOwner {
    // Disable renouncing ownership
    revert("Ownership cannot be renounced");
    }
}