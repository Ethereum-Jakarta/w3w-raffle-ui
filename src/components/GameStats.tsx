"use client"

import { BarChart3, Trophy, Crown, Loader2, DollarSign } from "lucide-react"
import type { RaffleInfo, PlayerEntry } from "../types/game"

interface GameStatsProps {
  raffleInfo: RaffleInfo
  playerEntries: PlayerEntry[]
  isOwner: boolean
  onPickWinner: () => void
  isPickingWinner: boolean
}

const GameStats = ({ raffleInfo, playerEntries, isOwner, onPickWinner, isPickingWinner }: GameStatsProps) => {
  const { gameOpen, playerCount, prizePool } = raffleInfo
  const prizeInUSDC = Number(prizePool) / 1_000_000

  // Calculate top players by entry count
  const topPlayers = [...playerEntries]
    .sort((a, b) => b.entryCount - a.entryCount)
    .slice(0, 5)

  // Calculate unique players
  const uniquePlayers = playerEntries.length

  // Calculate winning probability for top player
  const topPlayerChance = topPlayers[0]
    ? ((topPlayers[0].entryCount / playerCount) * 100).toFixed(1)
    : "0"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Player Statistics */}
      <div className="glass rounded-2xl p-8 card-hover border border-white/10">
        <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: "#FBFAF9" }}>
          <BarChart3 className="w-6 h-6 mr-3" style={{ color: "#836EF9" }} />
          Top Players
        </h3>

        {topPlayers.length > 0 ? (
          <div className="space-y-4">
            {topPlayers.map((player, index) => {
              const chance = ((player.entryCount / playerCount) * 100).toFixed(1)
              const isLeading = index === 0

              return (
                <div
                  key={player.address}
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: isLeading ? "rgba(131, 110, 249, 0.1)" : "rgba(14, 16, 15, 0.5)",
                    borderColor: isLeading ? "rgba(131, 110, 249, 0.3)" : "rgba(251, 250, 249, 0.2)",
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border font-bold"
                        style={{
                          backgroundColor: isLeading ? "rgba(131, 110, 249, 0.2)" : "rgba(251, 250, 249, 0.1)",
                          borderColor: isLeading ? "rgba(131, 110, 249, 0.4)" : "rgba(251, 250, 249, 0.2)",
                          color: isLeading ? "#836EF9" : "#FBFAF9",
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-mono text-sm" style={{ color: "#FBFAF9" }}>
                        {player.address.slice(0, 6)}...{player.address.slice(-4)}
                      </span>
                      {isLeading && (
                        <span className="text-sm">👑</span>
                      )}
                    </div>
                    <span className="font-bold text-lg" style={{ color: "#FBFAF9" }}>
                      {player.entryCount} {player.entryCount === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                  <div
                    className="relative w-full rounded-full h-2 overflow-hidden mb-2"
                    style={{ backgroundColor: "rgba(14, 16, 15, 0.5)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${chance}%`,
                        background: isLeading
                          ? "linear-gradient(to right, #836EF9, #4FC3F7)"
                          : "linear-gradient(to right, #1E90FF, #4FC3F7)",
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-right" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
                    {chance}% chance to win
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: "rgba(251, 250, 249, 0.5)" }}>
            <p>No players yet. Be the first to join!</p>
          </div>
        )}
      </div>

      {/* Raffle Info & Owner Controls */}
      <div className="glass rounded-2xl p-8 card-hover border border-white/10">
        <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: "#FBFAF9" }}>
          <Trophy className="w-6 h-6 mr-3" style={{ color: "#FF6B9D" }} />
          Raffle Information
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: "rgba(14, 16, 15, 0.5)",
                borderColor: "rgba(251, 250, 249, 0.2)",
              }}
            >
              <div className="text-sm mb-1" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
                Total Entries
              </div>
              <div className="font-bold text-lg" style={{ color: "#FBFAF9" }}>
                {playerCount}
              </div>
            </div>
            <div
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: "rgba(14, 16, 15, 0.5)",
                borderColor: "rgba(251, 250, 249, 0.2)",
              }}
            >
              <div className="text-sm mb-1" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
                Unique Players
              </div>
              <div className="font-bold text-lg" style={{ color: "#FBFAF9" }}>
                {uniquePlayers}
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: "rgba(76, 195, 247, 0.1)",
              borderColor: "rgba(76, 195, 247, 0.3)",
            }}
          >
            <div className="text-sm mb-1" style={{ color: "#4FC3F7" }}>
              Prize Pool
            </div>
            <div className="font-bold text-2xl flex items-center space-x-2" style={{ color: "#FBFAF9" }}>
              <DollarSign className="w-6 h-6" style={{ color: "#4FC3F7" }} />
              <span>{prizeInUSDC.toFixed(2)} USDC</span>
            </div>
          </div>

          <div
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: gameOpen ? "rgba(131, 110, 249, 0.1)" : "rgba(255, 107, 157, 0.1)",
              borderColor: gameOpen ? "rgba(131, 110, 249, 0.3)" : "rgba(255, 107, 157, 0.3)",
            }}
          >
            <div className="text-sm mb-1" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
              Status
            </div>
            <div className="font-bold text-lg flex items-center space-x-2">
              <span style={{ color: "#FBFAF9" }}>
                {gameOpen ? "🟢 OPEN" : "🔴 CLOSED"}
              </span>
            </div>
          </div>

          {/* Leading Player Info */}
          {topPlayers.length > 0 && gameOpen && (
            <div
              className="rounded-xl p-4 border"
              style={{
                background: "linear-gradient(135deg, rgba(131, 110, 249, 0.2), rgba(255, 107, 157, 0.2))",
                borderColor: "rgba(131, 110, 249, 0.3)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold" style={{ color: "#836EF9" }}>
                    👑 Leading Player
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: "#FBFAF9" }}>
                  {topPlayerChance}% chance
                </span>
              </div>
              <div className="font-mono text-sm" style={{ color: "#FBFAF9" }}>
                {topPlayers[0].address.slice(0, 10)}...{topPlayers[0].address.slice(-8)}
              </div>
              <div className="text-xs mt-1" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
                {topPlayers[0].entryCount} entries
              </div>
            </div>
          )}

          {/* Owner Controls */}
          {isOwner && (
            <div className="space-y-3 mt-6 pt-6 border-t border-white/10">
              <div className="text-center p-3 rounded-xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-400/30">
                <div className="text-sm font-bold text-gradient-primary mb-1">
                  <Crown className="w-4 h-4 inline mr-1" />
                  OWNER CONTROLS
                </div>
                <div className="text-xs text-gray-300">
                  You have administrative access
                </div>
              </div>

              {gameOpen && playerCount > 0 && (
                <button
                  onClick={onPickWinner}
                  disabled={isPickingWinner}
                  className="w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-w3gg btn-primary-w3gg sparkle"
                >
                  {isPickingWinner ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Picking Winner...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Trophy className="w-5 h-5" />
                      <span>Pick Winner Now</span>
                      <Trophy className="w-5 h-5" />
                    </div>
                  )}
                </button>
              )}

              {gameOpen && playerCount === 0 && (
                <div
                  className="text-center p-3 rounded-xl border"
                  style={{
                    backgroundColor: "rgba(255, 107, 157, 0.1)",
                    borderColor: "rgba(255, 107, 157, 0.3)",
                  }}
                >
                  <div className="text-sm" style={{ color: "#FF6B9D" }}>
                    ⚠️ Need at least 1 player to pick winner
                  </div>
                </div>
              )}

              {!gameOpen && (
                <div className="text-center p-3 rounded-xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-400/30">
                  <div className="text-sm font-bold text-gradient-primary">
                    🎉 Raffle Completed!
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Winner has been selected and prize sent
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameStats
