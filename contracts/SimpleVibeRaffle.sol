// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title IERC20
 * @notice Interface untuk USDC token
 */
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title SimpleVibeRaffle
 * @notice Smart contract untuk raffle game dengan USDC prize pool
 * @dev Educational purpose - NOT production ready!
 */
contract SimpleVibeRaffle {
    // ============================================
    // STATE VARIABLES
    // ============================================

    address public owner;           // Address yang deploy contract
    address[] public players;       // Array semua peserta
    bool public gameOpen;           // Status game (open/closed)
    address public lastWinner;      // Address pemenang terakhir
    uint256 public lastPrize;       // Hadiah terakhir yang diberikan
    uint256 public totalGamesPlayed; // Total game yang sudah dimainkan

    IERC20 public usdcToken;        // USDC token contract

    // ============================================
    // EVENTS
    // ============================================

    event PlayerJoined(address indexed player);
    event PlayersAddedByAdmin(address[] players, address indexed admin);
    event WinnerPicked(address indexed winner, uint256 prize);
    event PrizeFunded(address indexed funder, uint256 amount);
    event GameReset(address indexed admin, uint256 timestamp);

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @dev Constructor dipanggil saat deploy
     * @param _usdcAddress Address USDC token di Base Sepolia
     */
    constructor(address _usdcAddress) {
        owner = msg.sender;
        gameOpen = true;
        usdcToken = IERC20(_usdcAddress);
        totalGamesPlayed = 0;
    }

    // ============================================
    // MODIFIERS
    // ============================================

    /**
     * @dev Modifier untuk restrict fungsi hanya untuk owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ============================================
    // FUNCTIONS - OWNER ONLY
    // ============================================

    /**
     * @notice Owner bisa tambah prize pool dengan USDC
     * @dev Owner harus approve USDC dulu sebelum panggil fungsi ini
     * @param amount Jumlah USDC yang ditambahkan (dalam unit USDC)
     */
    function fundPrize(uint256 amount) external onlyOwner {
        uint256 amountInDecimals = amount * 10**6; // Convert to 6 decimals
        require(
            usdcToken.transferFrom(msg.sender, address(this), amountInDecimals),
            "USDC transfer failed"
        );

        emit PrizeFunded(msg.sender, amountInDecimals);
    }

    /**
     * @notice Admin bisa add player manual dari backend (single)
     * @dev Untuk registrasi offline atau manual registration
     * @param playerAddress Address player yang ingin ditambahkan
     */
    function addPlayer(address playerAddress) external onlyOwner {
        require(gameOpen, "Game is closed");
        require(playerAddress != address(0), "Invalid address");

        // Tambahkan address ke array players
        players.push(playerAddress);

        // Emit event untuk single player
        address[] memory singlePlayer = new address[](1);
        singlePlayer[0] = playerAddress;
        emit PlayersAddedByAdmin(singlePlayer, msg.sender);
    }

    /**
     * @notice Admin bisa add multiple players sekaligus (batch)
     * @dev Untuk batch registration, lebih gas efficient
     * @param playerAddresses Array of player addresses yang ingin ditambahkan
     */
    function addPlayersBatch(address[] calldata playerAddresses) external onlyOwner {
        require(gameOpen, "Game is closed");
        require(playerAddresses.length > 0, "Empty array");
        require(playerAddresses.length <= 100, "Too many players at once"); // Limit untuk gas

        for (uint256 i = 0; i < playerAddresses.length; i++) {
            require(playerAddresses[i] != address(0), "Invalid address in batch");
            players.push(playerAddresses[i]);
        }

        // Emit event untuk batch
        emit PlayersAddedByAdmin(playerAddresses, msg.sender);
    }

    /**
     * @notice Pilih pemenang secara random
     * @dev PERINGATAN: Random ini tidak aman untuk production!
     */
    function pickWinner() external onlyOwner {
        require(gameOpen, "Game already closed");
        require(players.length > 0, "No players joined");

        // Tutup game agar tidak ada yang bisa join lagi
        gameOpen = false;

        // Generate random number (SIMPLE, NOT SECURE!)
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,    // Waktu block saat ini
                    msg.sender,         // Address owner
                    players.length,     // Jumlah players
                    blockhash(block.number - 1) // Hash block sebelumnya
                )
            )
        );

        // Pilih index pemenang
        uint256 winnerIndex = random % players.length;
        address winner = players[winnerIndex];

        // Ambil seluruh saldo USDC contract
        uint256 prize = usdcToken.balanceOf(address(this));

        // Simpan data pemenang
        lastWinner = winner;
        lastPrize = prize;
        totalGamesPlayed++;

        // Transfer USDC ke pemenang
        require(usdcToken.transfer(winner, prize), "USDC transfer to winner failed");

        // Emit event
        emit WinnerPicked(winner, prize);
    }

    /**
     * @notice Reset game untuk mulai raffle baru
     * @dev Hapus semua players dan buka game lagi
     */
    function resetGame() external onlyOwner {
        require(!gameOpen, "Game is still open, pick winner first");

        // Reset array players
        delete players;

        // Buka game lagi
        gameOpen = true;

        // Emit event
        emit GameReset(msg.sender, block.timestamp);
    }

    /**
     * @notice Emergency reset - bisa dipanggil kapan saja
     * @dev Gunakan hanya jika ada masalah atau ingin cancel game
     */
    function emergencyReset() external onlyOwner {
        // Reset array players
        delete players;

        // Buka game lagi
        gameOpen = true;

        // Emit event
        emit GameReset(msg.sender, block.timestamp);
    }

    // ============================================
    // FUNCTIONS - PUBLIC
    // ============================================

    /**
     * @notice Join game raffle - GRATIS!
     * @dev Siapa saja bisa panggil, tidak perlu deposit
     */
    function joinGame() external {
        require(gameOpen, "Game is closed");

        // Tambahkan address ke array players
        players.push(msg.sender);

        // Emit event
        emit PlayerJoined(msg.sender);
    }

    /**
     * @notice Lihat semua players yang sudah join
     * @return Array of player addresses
     */
    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    /**
     * @notice Lihat jumlah players
     * @return Total number of players
     */
    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }

    /**
     * @notice Lihat total prize pool dalam USDC
     * @return Prize amount (6 decimals)
     */
    function getPrizePool() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @notice Lihat informasi pemenang terakhir
     * @return winner Address pemenang terakhir
     * @return prize Jumlah hadiah terakhir
     */
    function getLastWinner() external view returns (address winner, uint256 prize) {
        return (lastWinner, lastPrize);
    }

    /**
     * @notice Lihat total game yang sudah dimainkan
     * @return Total games played
     */
    function getTotalGamesPlayed() external view returns (uint256) {
        return totalGamesPlayed;
    }
}
