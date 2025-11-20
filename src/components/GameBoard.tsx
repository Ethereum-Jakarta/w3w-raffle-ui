import type { RaffleInfo } from "../types/game"

interface GameBoardProps {
  raffleInfo: RaffleInfo
}

const GameBoard = ({ raffleInfo }: GameBoardProps) => {
  const { gameOpen, playerCount, prizePool } = raffleInfo

  // Convert prize pool from USDC (6 decimals) to displayable number
  const prizeInUSDC = Number(prizePool) / 1_000_000

  // Calculate fill percentage for prize pool visualization (5-10 USDC range)
  const minVisualizationAmount = 5
  const maxVisualizationAmount = 10
  const visualizationRange = maxVisualizationAmount - minVisualizationAmount

  // Calculate fill percentage within 5-10 range
  const fillPercentage = Math.min(
    Math.max(((prizeInUSDC - minVisualizationAmount) / visualizationRange) * 100, 0),
    100
  )

  return (
    <div className="glass rounded-2xl p-8 card-hover border border-white/10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-4 text-gradient-primary font-inter font-bold">Raffle Status</h2>
        <div className="flex justify-center items-center gap-6 flex-wrap">
          {/* Game Status */}
          <div
            className={`flex items-center space-x-3 p-4 rounded-xl border ${gameOpen ? "glow-purple" : "opacity-70"}`}
            style={{
              backgroundColor: gameOpen ? "rgba(131, 110, 249, 0.1)" : "rgba(255, 107, 157, 0.1)",
              borderColor: gameOpen ? "rgba(131, 110, 249, 0.3)" : "rgba(255, 107, 157, 0.3)",
            }}
          >
            <span className="text-3xl">{gameOpen ? "🎫" : "🔒"}</span>
            <div>
              <div className="font-medium text-sm" style={{ color: gameOpen ? "#836EF9" : "#FF6B9D" }}>
                Game Status
              </div>
              <div className="font-bold text-2xl" style={{ color: "#FBFAF9" }}>
                {gameOpen ? "OPEN" : "CLOSED"}
              </div>
            </div>
          </div>

          {/* Player Count */}
          <div
            className="flex items-center space-x-3 p-4 rounded-xl border glow-hover"
            style={{
              backgroundColor: "rgba(30, 144, 255, 0.1)",
              borderColor: "rgba(30, 144, 255, 0.3)",
            }}
          >
            <span className="text-3xl">👥</span>
            <div>
              <div className="font-medium text-sm" style={{ color: "#1E90FF" }}>
                Total Entries
              </div>
              <div className="font-bold text-2xl" style={{ color: "#FBFAF9" }}>
                {playerCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prize Pool Visualization */}
      <div className="relative mb-8">
        <div className="flex justify-between text-sm mb-4 px-4" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
          <span className="font-medium">Prize Pool</span>
          <span className="font-medium text-gradient-primary">{prizeInUSDC.toFixed(2)} USDC</span>
        </div>

        <div
          className="relative h-20 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm"
          style={{
            background: `linear-gradient(to right,
                 rgba(14, 16, 15, 0.3) 0%,
                 rgba(131, 110, 249, 0.2) 50%,
                 rgba(76, 195, 247, 0.2) 100%)`,
          }}
        >
          {/* Prize pool fill */}
          <div
            className="absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out gradient-monad-primary"
            style={{
              width: `${fillPercentage}%`,
              opacity: 0.3,
            }}
          ></div>

          {/* Grid lines */}
          <div
            className="absolute left-1/4 top-4 bottom-4 w-px"
            style={{ backgroundColor: "rgba(251, 250, 249, 0.2)" }}
          ></div>
          <div
            className="absolute left-1/2 top-2 bottom-2 w-0.5"
            style={{ backgroundColor: "rgba(251, 250, 249, 0.4)" }}
          ></div>
          <div
            className="absolute right-1/4 top-4 bottom-4 w-px"
            style={{ backgroundColor: "rgba(251, 250, 249, 0.2)" }}
          ></div>

          {/* Prize indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl border-2 gradient-monad-primary"
              style={{ borderColor: "rgba(251, 250, 249, 0.3)" }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(to bottom right, rgba(251, 250, 249, 0.2), transparent)" }}
              ></div>
              <span className="relative z-10">💰</span>
            </div>
          </div>

          {/* Amount markers */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border text-xs font-mono font-bold"
              style={{
                backgroundColor: "rgba(131, 110, 249, 0.2)",
                borderColor: "rgba(131, 110, 249, 0.4)",
                color: "#836EF9",
              }}
            >
              {minVisualizationAmount}
            </div>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border text-xs font-mono font-bold"
              style={{
                backgroundColor: "rgba(76, 195, 247, 0.2)",
                borderColor: "rgba(76, 195, 247, 0.4)",
                color: "#4FC3F7",
              }}
            >
              {prizeInUSDC > maxVisualizationAmount ? `${maxVisualizationAmount}+` : maxVisualizationAmount}
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs mt-2 px-4" style={{ color: "rgba(251, 250, 249, 0.5)" }}>
          <span>${minVisualizationAmount} (Min)</span>
          <span>{fillPercentage.toFixed(0)}% of range</span>
          <span>${maxVisualizationAmount} (Max)</span>
        </div>
      </div>

      {/* Status message */}
      <div className="text-center space-y-2">
        <div
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border"
          style={{
            backgroundColor: prizeInUSDC < minVisualizationAmount
              ? "rgba(255, 107, 157, 0.1)"
              : "rgba(14, 16, 15, 0.5)",
            borderColor: prizeInUSDC < minVisualizationAmount
              ? "rgba(255, 107, 157, 0.3)"
              : "rgba(251, 250, 249, 0.2)",
          }}
        >
          <span style={{ color: "rgba(251, 250, 249, 0.7)" }}>Current Prize Pool:</span>
          <span className="font-mono font-bold text-2xl text-gradient-primary">
            ${prizeInUSDC.toFixed(2)}
          </span>
          <span style={{ color: "rgba(251, 250, 249, 0.7)" }}>USDC</span>
        </div>

        {prizeInUSDC > 0 && prizeInUSDC < minVisualizationAmount && (
          <p className="text-sm" style={{ color: "#FF6B9D" }}>
            ⚠️ Below minimum recommended amount (${minVisualizationAmount} USDC)
          </p>
        )}

        {gameOpen ? (
          <p className="text-sm" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
            {playerCount === 0
              ? "🎫 Be the first to join the raffle!"
              : playerCount === 1
                ? "🎫 1 entry so far - join now for better odds!"
                : `🎫 ${playerCount} entries competing for the prize!`}
          </p>
        ) : (
          <p className="text-sm font-medium" style={{ color: "#FF6B9D" }}>
            🔒 Raffle is closed. Winner has been selected!
          </p>
        )}
      </div>

      {/* Winner announcement (when game is closed) */}
      {!gameOpen && playerCount > 0 && (
        <div className="mt-8 text-center">
          <div
            className="inline-flex items-center space-x-3 font-bold py-4 px-8 rounded-2xl shadow-2xl victory-pulse border gradient-monad-primary"
            style={{
              color: "#FBFAF9",
              borderColor: "rgba(251, 250, 249, 0.3)",
            }}
          >
            <span className="text-2xl">🎉</span>
            <span className="text-xl">Raffle Complete - Check History for Winner!</span>
            <span className="text-2xl">🎉</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
