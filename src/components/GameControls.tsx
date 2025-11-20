"use client"

import { Ticket, Loader2 } from "lucide-react"

interface GameControlsProps {
  onJoinGame: () => void
  isConnected: boolean
  gameOpen: boolean
  isLoading: boolean
}

const GameControls = ({ onJoinGame, isConnected, gameOpen, isLoading }: GameControlsProps) => {
  const handleJoin = () => {
    if (!isConnected || !gameOpen || isLoading) return
    onJoinGame()
  }

  const getButtonClass = () => {
    const baseClass =
      "group relative w-full py-8 px-8 rounded-2xl font-bold text-xl transition-all duration-300 transform border-2 overflow-hidden"

    if (!isConnected || !gameOpen) {
      return `${baseClass} cursor-not-allowed border-opacity-30`
    }

    if (isLoading) {
      return `${baseClass} cursor-not-allowed opacity-50`
    }

    const hoverEffect = "hover:scale-105 hover:shadow-2xl active:scale-95"

    return `${baseClass} ${hoverEffect} btn-primary`
  }

  const getButtonStyle = () => {
    if (!isConnected || !gameOpen) {
      return {
        backgroundColor: "rgba(14, 16, 15, 0.5)",
        borderColor: "rgba(251, 250, 249, 0.2)",
        color: "rgba(251, 250, 249, 0.5)",
      }
    }

    if (isLoading) {
      return {
        backgroundColor: "rgba(131, 110, 249, 0.5)",
        borderColor: "rgba(131, 110, 249, 0.3)",
        color: "#FBFAF9",
      }
    }

    return {
      background: "linear-gradient(135deg, #836EF9 0%, #4FC3F7 100%)",
      borderColor: "rgba(131, 110, 249, 0.5)",
      color: "#FBFAF9",
    }
  }

  return (
    <div className="glass rounded-2xl p-8 card-hover border border-white/10">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2" style={{ color: "#FBFAF9" }}>
          Join The Raffle
        </h3>
        <p style={{ color: "rgba(251, 250, 249, 0.7)" }}>
          Click to enter - the more you join, the higher your chances to win!
        </p>
      </div>

      {!isConnected && (
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border"
            style={{
              backgroundColor: "rgba(131, 110, 249, 0.1)",
              borderColor: "rgba(131, 110, 249, 0.3)",
            }}
          >
            <span style={{ color: "#836EF9" }}>⚠️</span>
            <span className="text-sm font-medium" style={{ color: "#836EF9" }}>
              Connect your wallet to join!
            </span>
          </div>
        </div>
      )}

      {isConnected && !gameOpen && (
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border"
            style={{
              backgroundColor: "rgba(255, 107, 157, 0.1)",
              borderColor: "rgba(255, 107, 157, 0.3)",
            }}
          >
            <span style={{ color: "#FF6B9D" }}>🔒</span>
            <span className="text-sm font-medium" style={{ color: "#FF6B9D" }}>
              Raffle is closed. Winner has been selected!
            </span>
          </div>
        </div>
      )}

      <div>
        <button
          onClick={handleJoin}
          disabled={!isConnected || !gameOpen || isLoading}
          className={getButtonClass()}
          style={getButtonStyle()}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to right, rgba(131, 110, 249, 0.3), rgba(76, 195, 247, 0.3))" }}
          ></div>
          <div className="relative flex items-center justify-center space-x-4">
            <Ticket className="w-8 h-8" />
            <div className="text-center">
              <div className="text-2xl font-bold">
                {isLoading ? "Joining..." : "Join Raffle FREE"}
              </div>
              <div className="text-sm opacity-90 flex items-center justify-center space-x-2 mt-1">
                <span>🎫</span>
                <span>No entry fee • Multiple entries allowed</span>
              </div>
            </div>
            <Ticket className="w-8 h-8" />
          </div>
        </button>
      </div>

      {isLoading && (
        <div className="text-center mt-6">
          <div
            className="inline-flex items-center space-x-3 px-6 py-3 rounded-xl border"
            style={{
              backgroundColor: "rgba(14, 16, 15, 0.5)",
              borderColor: "rgba(251, 250, 249, 0.2)",
            }}
          >
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#836EF9" }} />
            <span className="font-medium" style={{ color: "#FBFAF9" }}>
              Processing entry...
            </span>
          </div>
        </div>
      )}

      {isConnected && gameOpen && !isLoading && (
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: "rgba(251, 250, 249, 0.5)" }}>
            💡 Pro tip: You can join multiple times to increase your winning chances!
          </p>
        </div>
      )}
    </div>
  )
}

export default GameControls
