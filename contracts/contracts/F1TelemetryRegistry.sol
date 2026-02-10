// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title F1TelemetryRegistry
 * @notice Smart contract for storing immutable F1 lap records on Polygon Mumbai testnet
 * @dev Stores lap summaries on-chain, full telemetry data stored on IPFS
 * 
 * Features:
 * - Immutable lap time records
 * - IPFS hash storage for full telemetry data
 * - On-chain leaderboard (top 10 fastest laps)
 * - Performance scoring (0-100)
 * - Sector time breakdown
 */
contract F1TelemetryRegistry {
    
    // ========== STRUCTS ==========
    
    /**
     * @notice Complete lap record stored on-chain
     */
    struct LapRecord {
        uint256 lapNumber;           // Sequential lap number
        uint256 lapTime;             // Lap time in milliseconds (e.g., 88456 = 88.456s)
        string ipfsHash;             // IPFS hash of full telemetry JSON
        uint8 performanceScore;      // AI performance score (0-100)
        uint256[3] sectorTimes;      // Sector times in milliseconds
        address recorder;            // Address that recorded the lap
        uint256 timestamp;           // Block timestamp when recorded
        bool exists;                 // Check if lap exists
    }
    
    // ========== STATE VARIABLES ==========
    
    /// @notice Mapping of lap number to lap record
    mapping(uint256 => LapRecord) public laps;
    
    /// @notice Array of all lap numbers (for iteration)
    uint256[] public lapNumbers;
    
    /// @notice Total number of laps recorded
    uint256 public totalLaps;
    
    /// @notice Contract owner (for emergency functions)
    address public owner;
    
    // ========== EVENTS ==========
    
    /**
     * @notice Emitted when a new lap is recorded
     */
    event LapRecorded(
        uint256 indexed lapNumber,
        uint256 lapTime,
        string ipfsHash,
        uint8 performanceScore,
        address indexed recorder,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when a new fastest lap is set
     */
    event NewFastestLap(
        uint256 indexed lapNumber,
        uint256 lapTime,
        address indexed recorder
    );
    
    // ========== MODIFIERS ==========
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier lapNotExists(uint256 _lapNumber) {
        require(!laps[_lapNumber].exists, "Lap already recorded");
        _;
    }
    
    modifier lapExists(uint256 _lapNumber) {
        require(laps[_lapNumber].exists, "Lap does not exist");
        _;
    }
    
    // ========== CONSTRUCTOR ==========
    
    constructor() {
        owner = msg.sender;
    }
    
    // ========== CORE FUNCTIONS ==========
    
    /**
     * @notice Record a new lap on-chain
     * @param _lapNumber Sequential lap number
     * @param _lapTime Lap time in milliseconds
     * @param _ipfsHash IPFS hash containing full telemetry data
     * @param _performanceScore AI-calculated performance score (0-100)
     * @param _sectorTimes Array of 3 sector times in milliseconds
     * @dev Emits LapRecorded event and potentially NewFastestLap event
     */
    function recordLap(
        uint256 _lapNumber,
        uint256 _lapTime,
        string memory _ipfsHash,
        uint8 _performanceScore,
        uint256[3] memory _sectorTimes
    ) external lapNotExists(_lapNumber) {
        require(_lapTime > 0, "Lap time must be greater than 0");
        require(_performanceScore <= 100, "Performance score must be <= 100");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        // Validate sector times sum approximately equals lap time (allow 1% tolerance)
        uint256 sectorSum = _sectorTimes[0] + _sectorTimes[1] + _sectorTimes[2];
        require(
            sectorSum >= (_lapTime * 99 / 100) && sectorSum <= (_lapTime * 101 / 100),
            "Sector times must sum to lap time"
        );
        
        // Create lap record
        laps[_lapNumber] = LapRecord({
            lapNumber: _lapNumber,
            lapTime: _lapTime,
            ipfsHash: _ipfsHash,
            performanceScore: _performanceScore,
            sectorTimes: _sectorTimes,
            recorder: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        lapNumbers.push(_lapNumber);
        totalLaps++;
        
        emit LapRecorded(
            _lapNumber,
            _lapTime,
            _ipfsHash,
            _performanceScore,
            msg.sender,
            block.timestamp
        );
        
        // Check if this is a new fastest lap
        if (_lapTime <= getFastestLapTime()) {
            emit NewFastestLap(_lapNumber, _lapTime, msg.sender);
        }
    }
    
    /**
     * @notice Get lap record by lap number
     * @param _lapNumber Lap number to retrieve
     * @return Lap record struct
     */
    function getLap(uint256 _lapNumber) 
        external 
        view 
        lapExists(_lapNumber) 
        returns (LapRecord memory) 
    {
        return laps[_lapNumber];
    }
    
    /**
     * @notice Get multiple laps by array of lap numbers
     * @param _lapNumbers Array of lap numbers
     * @return Array of lap records
     */
    function getMultipleLaps(uint256[] memory _lapNumbers) 
        external 
        view 
        returns (LapRecord[] memory) 
    {
        LapRecord[] memory records = new LapRecord[](_lapNumbers.length);
        
        for (uint256 i = 0; i < _lapNumbers.length; i++) {
            if (laps[_lapNumbers[i]].exists) {
                records[i] = laps[_lapNumbers[i]];
            }
        }
        
        return records;
    }
    
    /**
     * @notice Get all lap numbers (for frontend iteration)
     * @return Array of all lap numbers
     */
    function getAllLapNumbers() external view returns (uint256[] memory) {
        return lapNumbers;
    }
    
    // ========== LEADERBOARD FUNCTIONS ==========
    
    /**
     * @notice Get top N fastest laps
     * @param _count Number of laps to return (max 50)
     * @return Array of fastest lap records
     */
    function getLeaderboard(uint256 _count) 
        external 
        view 
        returns (LapRecord[] memory) 
    {
        require(_count > 0 && _count <= 50, "Count must be between 1 and 50");
        
        uint256 resultCount = _count > totalLaps ? totalLaps : _count;
        LapRecord[] memory leaderboard = new LapRecord[](resultCount);
        
        // Get all laps
        LapRecord[] memory allLaps = new LapRecord[](totalLaps);
        for (uint256 i = 0; i < totalLaps; i++) {
            allLaps[i] = laps[lapNumbers[i]];
        }
        
        // Bubble sort to find top N (simple approach for small datasets)
        for (uint256 i = 0; i < resultCount; i++) {
            uint256 minIndex = i;
            for (uint256 j = i + 1; j < totalLaps; j++) {
                if (allLaps[j].lapTime < allLaps[minIndex].lapTime) {
                    minIndex = j;
                }
            }
            // Swap
            if (minIndex != i) {
                LapRecord memory temp = allLaps[i];
                allLaps[i] = allLaps[minIndex];
                allLaps[minIndex] = temp;
            }
            leaderboard[i] = allLaps[i];
        }
        
        return leaderboard;
    }
    
    /**
     * @notice Get fastest lap time
     * @return Fastest lap time in milliseconds (returns max uint256 if no laps)
     */
    function getFastestLapTime() public view returns (uint256) {
        if (totalLaps == 0) {
            return type(uint256).max;
        }
        
        uint256 fastest = type(uint256).max;
        for (uint256 i = 0; i < totalLaps; i++) {
            if (laps[lapNumbers[i]].lapTime < fastest) {
                fastest = laps[lapNumbers[i]].lapTime;
            }
        }
        return fastest;
    }
    
    /**
     * @notice Get lap number of fastest lap
     * @return Lap number of fastest recorded lap
     */
    function getFastestLapNumber() external view returns (uint256) {
        require(totalLaps > 0, "No laps recorded yet");
        
        uint256 fastestLap = 0;
        uint256 fastestTime = type(uint256).max;
        
        for (uint256 i = 0; i < totalLaps; i++) {
            if (laps[lapNumbers[i]].lapTime < fastestTime) {
                fastestTime = laps[lapNumbers[i]].lapTime;
                fastestLap = lapNumbers[i];
            }
        }
        
        return fastestLap;
    }
    
    // ========== STATISTICS FUNCTIONS ==========
    
    /**
     * @notice Get average lap time of all recorded laps
     * @return Average lap time in milliseconds
     */
    function getAverageLapTime() external view returns (uint256) {
        require(totalLaps > 0, "No laps recorded yet");
        
        uint256 totalTime = 0;
        for (uint256 i = 0; i < totalLaps; i++) {
            totalTime += laps[lapNumbers[i]].lapTime;
        }
        
        return totalTime / totalLaps;
    }
    
    /**
     * @notice Get total laps recorded by a specific address
     * @param _recorder Address to check
     * @return Number of laps recorded by address
     */
    function getLapsByRecorder(address _recorder) 
        external 
        view 
        returns (uint256) 
    {
        uint256 count = 0;
        for (uint256 i = 0; i < totalLaps; i++) {
            if (laps[lapNumbers[i]].recorder == _recorder) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @notice Check if lap number exists
     * @param _lapNumber Lap number to check
     * @return True if lap exists
     */
    function lapRecordExists(uint256 _lapNumber) external view returns (bool) {
        return laps[_lapNumber].exists;
    }
}
