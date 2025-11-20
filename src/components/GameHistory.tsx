"use client"

import { useState } from "react"
import { Clock, Trophy, UserPlus, DollarSign, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import type { RaffleEvent, PlayerEntry } from "../types/game"

interface GameHistoryProps {
  events: RaffleEvent[]
  playerEntries: PlayerEntry[]
}

const GameHistory = ({ events, playerEntries }: GameHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getEventIcon = (type: string) => {
    switch (type) {
      case "join":
      case "adminAdd":
        return <UserPlus className="w-4 h-4" style={{ color: "#1E90FF" }} />
      case "winner":
        return <Trophy className="w-4 h-4" style={{ color: "#FBCC16" }} />
      case "funded":
        return <DollarSign className="w-4 h-4" style={{ color: "#836EF9" }} />
      default:
        return <UserPlus className="w-4 h-4" />
    }
  }

  const getEventMessage = (event: RaffleEvent) => {
    switch (event.type) {
      case "join":
        return "Player joined the raffle"
      case "adminAdd":
        return "Player added by admin"
      case "winner":
        const prizeAmount = event.amount ? (Number(event.amount) / 1_000_000).toFixed(2) : "0"
        return `Winner selected! Prize: ${prizeAmount} USDC`
      case "funded":
        const fundAmount = event.amount ? (Number(event.amount) / 1_000_000).toFixed(2) : "0"
        return `Prize pool funded: ${fundAmount} USDC`
      default:
        return "Unknown event"
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "join":
      case "adminAdd":
        return {
          backgroundColor: "rgba(30, 144, 255, 0.1)",
          borderColor: "rgba(30, 144, 255, 0.2)",
          hoverBg: "rgba(30, 144, 255, 0.2)",
        }
      case "winner":
        return {
          backgroundColor: "rgba(251, 204, 22, 0.15)",
          borderColor: "rgba(251, 204, 22, 0.3)",
          hoverBg: "rgba(251, 204, 22, 0.25)",
        }
      case "funded":
        return {
          backgroundColor: "rgba(131, 110, 249, 0.1)",
          borderColor: "rgba(131, 110, 249, 0.2)",
          hoverBg: "rgba(131, 110, 249, 0.2)",
        }
      default:
        return {
          backgroundColor: "rgba(14, 16, 15, 0.3)",
          borderColor: "rgba(251, 250, 249, 0.1)",
          hoverBg: "rgba(14, 16, 15, 0.5)",
        }
    }
  }

  const getAddressToDisplay = (event: RaffleEvent) => {
    if (event.type === "winner") return event.winner
    return event.player
  }

  return (
    <div className="glass rounded-2xl p-8 card-hover border border-white/10">
      <button
        className="w-full flex items-center justify-between hover:bg-white/5 rounded-xl p-3 -m-3 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-2xl font-bold flex items-center" style={{ color: "#FBFAF9" }}>
          <Clock className="w-6 h-6 mr-3" style={{ color: "#836EF9" }} />
          Event History
          <span
            className="ml-3 text-lg px-3 py-1 rounded-full border font-medium"
            style={{
              backgroundColor: "rgba(14, 16, 15, 0.5)",
              color: "#FBFAF9",
              borderColor: "rgba(251, 250, 249, 0.2)",
            }}
          >
            {events.length}
          </span>
        </h3>
        <div className="transition-transform duration-200" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 float-animation">🎫</div>
              <h4 className="text-xl font-semibold mb-2" style={{ color: "#FBFAF9" }}>
                No events yet
              </h4>
              <p style={{ color: "rgba(251, 250, 249, 0.6)" }}>Join the raffle to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {events
                .slice()
                .reverse()
                .map((event, index) => {
                  const colors = getEventColor(event.type)
                  const address = getAddressToDisplay(event)

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        backgroundColor: colors.backgroundColor,
                        borderColor: colors.borderColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.hoverBg
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.backgroundColor
                      }}
                    >
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
                        style={{
                          backgroundColor: "rgba(14, 16, 15, 0.5)",
                          borderColor: "rgba(251, 250, 249, 0.2)",
                        }}
                      >
                        {getEventIcon(event.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium" style={{ color: "#FBFAF9" }}>
                          {getEventMessage(event)}
                        </p>
                        <p className="text-sm" style={{ color: "rgba(251, 250, 249, 0.5)" }}>
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>

                      {address && (
                        <div className="flex-shrink-0 flex items-center space-x-2">
                          <div
                            className="text-xs font-mono px-2 py-1 rounded border"
                            style={{
                              backgroundColor: "rgba(14, 16, 15, 0.5)",
                              color: "rgba(251, 250, 249, 0.6)",
                              borderColor: "rgba(251, 250, 249, 0.2)",
                            }}
                          >
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </div>
                          {event.transactionHash && (
                            <a
                              href={`https://sepolia.basescan.org/tx/${event.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs hover:text-purple-400 transition-colors"
                              style={{ color: "rgba(131, 110, 249, 0.6)" }}
                              title="View on BaseScan"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {event.type === "winner" && (
                        <div className="flex-shrink-0">
                          <span className="text-2xl">🏆</span>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          )}

          {/* Player List Section */}
          {playerEntries.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-lg font-bold mb-4 flex items-center" style={{ color: "#FBFAF9" }}>
                <UserPlus className="w-5 h-5 mr-2" style={{ color: "#1E90FF" }} />
                All Participants ({playerEntries.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                {playerEntries.map((player, index) => (
                  <div
                    key={player.address}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{
                      backgroundColor: "rgba(14, 16, 15, 0.3)",
                      borderColor: "rgba(251, 250, 249, 0.1)",
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border"
                        style={{
                          backgroundColor: "rgba(131, 110, 249, 0.2)",
                          borderColor: "rgba(131, 110, 249, 0.3)",
                          color: "#836EF9",
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs font-mono" style={{ color: "rgba(251, 250, 249, 0.8)" }}>
                        {player.address.slice(0, 8)}...{player.address.slice(-6)}
                      </span>
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-1 rounded border"
                      style={{
                        backgroundColor: "rgba(30, 144, 255, 0.1)",
                        borderColor: "rgba(30, 144, 255, 0.3)",
                        color: "#1E90FF",
                      }}
                    >
                      {player.entryCount}x
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GameHistory
