"use client"

import { useState } from "react"
import { Crown, Trophy, DollarSign, UserPlus, Loader2, Settings, RotateCcw, Users } from "lucide-react"
import type { RaffleInfo } from "../types/game"

interface AdminPanelProps {
  raffleInfo: RaffleInfo
  onPickWinner: () => void
  onFundPrize: (amount: number) => void
  onAddPlayer: (address: string) => void
  onAddPlayersBatch: (addresses: string[]) => void
  onResetGame: () => void
  onEmergencyReset: () => void
  isPickingWinner: boolean
  isFundingPrize: boolean
  isAddingPlayer: boolean
  isResetting: boolean
}

const AdminPanel = ({
  raffleInfo,
  onPickWinner,
  onFundPrize,
  onAddPlayer,
  onAddPlayersBatch,
  onResetGame,
  onEmergencyReset,
  isPickingWinner,
  isFundingPrize,
  isAddingPlayer,
  isResetting,
}: AdminPanelProps) => {
  const { gameOpen, playerCount } = raffleInfo
  const [fundAmount, setFundAmount] = useState("")
  const [playerAddress, setPlayerAddress] = useState("")
  const [batchAddresses, setBatchAddresses] = useState("")
  const [showFundForm, setShowFundForm] = useState(false)
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false)
  const [showBatchAddForm, setShowBatchAddForm] = useState(false)

  const handleFundPrize = () => {
    const amount = parseFloat(fundAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }
    onFundPrize(amount)
    setFundAmount("")
    setShowFundForm(false)
  }

  const handleAddPlayer = () => {
    if (!playerAddress || !playerAddress.startsWith("0x") || playerAddress.length !== 42) {
      alert("Please enter a valid Ethereum address")
      return
    }
    onAddPlayer(playerAddress)
    setPlayerAddress("")
    setShowAddPlayerForm(false)
  }

  const handleBatchAdd = () => {
    // Parse addresses from textarea (one per line or comma-separated)
    const addresses = batchAddresses
      .split(/[\n,]/)
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0)

    if (addresses.length === 0) {
      alert("Please enter at least one address")
      return
    }

    // Validate all addresses
    for (const addr of addresses) {
      if (!addr.startsWith("0x") || addr.length !== 42) {
        alert(`Invalid address: ${addr}`)
        return
      }
    }

    if (addresses.length > 100) {
      alert("Maximum 100 addresses per batch")
      return
    }

    onAddPlayersBatch(addresses)
    setBatchAddresses("")
    setShowBatchAddForm(false)
  }

  return (
    <div className="glass rounded-2xl p-8 card-hover border border-purple-400/30">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-400/30 mb-4">
          <Crown className="w-6 h-6" style={{ color: "#836EF9" }} />
          <h3 className="text-2xl font-bold text-gradient-primary">Admin Panel</h3>
          <Settings className="w-6 h-6" style={{ color: "#836EF9" }} />
        </div>
        <p className="text-sm" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
          Owner-only administrative controls
        </p>
      </div>

      {/* Admin Actions */}
      <div className="space-y-4">
        {/* Pick Winner */}
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: "rgba(131, 110, 249, 0.1)",
            borderColor: "rgba(131, 110, 249, 0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" style={{ color: "#836EF9" }} />
              <h4 className="font-bold" style={{ color: "#FBFAF9" }}>
                Pick Winner
              </h4>
            </div>
            <span
              className="text-xs px-2 py-1 rounded border"
              style={{
                backgroundColor: gameOpen ? "rgba(76, 195, 247, 0.2)" : "rgba(255, 107, 157, 0.2)",
                borderColor: gameOpen ? "rgba(76, 195, 247, 0.4)" : "rgba(255, 107, 157, 0.4)",
                color: gameOpen ? "#4FC3F7" : "#FF6B9D",
              }}
            >
              {gameOpen ? "Game Open" : "Game Closed"}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
            Randomly select a winner from all entries. The prize will be automatically sent to the winner's wallet.
          </p>
          {gameOpen && playerCount > 0 ? (
            <button
              onClick={onPickWinner}
              disabled={isPickingWinner}
              className="w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-w3gg btn-primary-w3gg sparkle"
            >
              {isPickingWinner ? (
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Picking Winner...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Trophy className="w-5 h-5" />
                  <span>Pick Winner Now ({playerCount} entries)</span>
                </div>
              )}
            </button>
          ) : (
            <div
              className="text-center p-3 rounded-xl border"
              style={{
                backgroundColor: "rgba(255, 107, 157, 0.1)",
                borderColor: "rgba(255, 107, 157, 0.3)",
              }}
            >
              <div className="text-sm" style={{ color: "#FF6B9D" }}>
                {!gameOpen
                  ? "⚠️ Game is already closed"
                  : "⚠️ Need at least 1 player to pick winner"}
              </div>
            </div>
          )}
        </div>

        {/* Fund Prize Pool */}
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: "rgba(131, 110, 249, 0.1)",
            borderColor: "rgba(131, 110, 249, 0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" style={{ color: "#836EF9" }} />
              <h4 className="font-bold" style={{ color: "#FBFAF9" }}>
                Fund Prize Pool
              </h4>
            </div>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
            Add USDC to the prize pool. You must approve USDC spending first.
          </p>
          {!showFundForm ? (
            <button
              onClick={() => setShowFundForm(true)}
              className="w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 btn-w3gg btn-secondary-w3gg"
            >
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Add Funds</span>
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount in USDC (e.g., 10)"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border font-mono"
                style={{
                  backgroundColor: "rgba(14, 16, 15, 0.5)",
                  borderColor: "rgba(251, 250, 249, 0.2)",
                  color: "#FBFAF9",
                }}
                min="0"
                step="0.01"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleFundPrize}
                  disabled={isFundingPrize}
                  className="flex-1 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-w3gg btn-primary-w3gg"
                >
                  {isFundingPrize ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Funding...</span>
                    </div>
                  ) : (
                    "Confirm"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowFundForm(false)
                    setFundAmount("")
                  }}
                  className="px-6 py-3 rounded-xl border transition-all hover:bg-opacity-20"
                  style={{
                    backgroundColor: "rgba(255, 107, 157, 0.1)",
                    borderColor: "rgba(255, 107, 157, 0.3)",
                    color: "#FF6B9D",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Player Manually */}
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: "rgba(30, 144, 255, 0.1)",
            borderColor: "rgba(30, 144, 255, 0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" style={{ color: "#1E90FF" }} />
              <h4 className="font-bold" style={{ color: "#FBFAF9" }}>
                Add Player Manually
              </h4>
            </div>
            <span
              className="text-xs px-2 py-1 rounded border"
              style={{
                backgroundColor: gameOpen ? "rgba(76, 195, 247, 0.2)" : "rgba(255, 107, 157, 0.2)",
                borderColor: gameOpen ? "rgba(76, 195, 247, 0.4)" : "rgba(255, 107, 157, 0.4)",
                color: gameOpen ? "#4FC3F7" : "#FF6B9D",
              }}
            >
              {gameOpen ? "Available" : "Closed"}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
            Manually add a player address for offline or batch registration.
          </p>
          {gameOpen ? (
            !showAddPlayerForm ? (
              <button
                onClick={() => setShowAddPlayerForm(true)}
                className="w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 btn-w3gg btn-secondary-w3gg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Add Player</span>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="0x... (Ethereum address)"
                  value={playerAddress}
                  onChange={(e) => setPlayerAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border font-mono text-sm"
                  style={{
                    backgroundColor: "rgba(14, 16, 15, 0.5)",
                    borderColor: "rgba(251, 250, 249, 0.2)",
                    color: "#FBFAF9",
                  }}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddPlayer}
                    disabled={isAddingPlayer}
                    className="flex-1 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-w3gg btn-primary-w3gg"
                  >
                    {isAddingPlayer ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPlayerForm(false)
                      setPlayerAddress("")
                    }}
                    className="px-6 py-3 rounded-xl border transition-all hover:bg-opacity-20"
                    style={{
                      backgroundColor: "rgba(255, 107, 157, 0.1)",
                      borderColor: "rgba(255, 107, 157, 0.3)",
                      color: "#FF6B9D",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : (
            <div
              className="text-center p-3 rounded-xl border"
              style={{
                backgroundColor: "rgba(255, 107, 157, 0.1)",
                borderColor: "rgba(255, 107, 157, 0.3)",
              }}
            >
              <div className="text-sm" style={{ color: "#FF6B9D" }}>
                ⚠️ Game is closed
              </div>
            </div>
          )}
        </div>

        {/* Batch Add Players */}
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: "rgba(30, 144, 255, 0.1)",
            borderColor: "rgba(30, 144, 255, 0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" style={{ color: "#1E90FF" }} />
              <h4 className="font-bold" style={{ color: "#FBFAF9" }}>
                Batch Add Players
              </h4>
            </div>
            <span
              className="text-xs px-2 py-1 rounded border"
              style={{
                backgroundColor: gameOpen ? "rgba(76, 195, 247, 0.2)" : "rgba(255, 107, 157, 0.2)",
                borderColor: gameOpen ? "rgba(76, 195, 247, 0.4)" : "rgba(255, 107, 157, 0.4)",
                color: gameOpen ? "#4FC3F7" : "#FF6B9D",
              }}
            >
              {gameOpen ? "Available" : "Closed"}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
            Add multiple players at once (up to 100). Enter addresses one per line or comma-separated.
          </p>
          {gameOpen ? (
            !showBatchAddForm ? (
              <button
                onClick={() => setShowBatchAddForm(true)}
                className="w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 btn-w3gg btn-secondary-w3gg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Batch Add</span>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  placeholder="0x123...&#10;0x456...&#10;or comma-separated"
                  value={batchAddresses}
                  onChange={(e) => setBatchAddresses(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border font-mono text-sm resize-none"
                  style={{
                    backgroundColor: "rgba(14, 16, 15, 0.5)",
                    borderColor: "rgba(251, 250, 249, 0.2)",
                    color: "#FBFAF9",
                  }}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleBatchAdd}
                    disabled={isAddingPlayer}
                    className="flex-1 font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-w3gg btn-primary-w3gg"
                  >
                    {isAddingPlayer ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      "Confirm Batch"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowBatchAddForm(false)
                      setBatchAddresses("")
                    }}
                    className="px-6 py-3 rounded-xl border transition-all hover:bg-opacity-20"
                    style={{
                      backgroundColor: "rgba(255, 107, 157, 0.1)",
                      borderColor: "rgba(255, 107, 157, 0.3)",
                      color: "#FF6B9D",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : (
            <div
              className="text-center p-3 rounded-xl border"
              style={{
                backgroundColor: "rgba(255, 107, 157, 0.1)",
                borderColor: "rgba(255, 107, 157, 0.3)",
              }}
            >
              <div className="text-sm" style={{ color: "#FF6B9D" }}>
                ⚠️ Game is closed
              </div>
            </div>
          )}
        </div>

        {/* Reset Game Section */}
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: "rgba(131, 110, 249, 0.1)",
            borderColor: "rgba(131, 110, 249, 0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5" style={{ color: "#836EF9" }} />
              <h4 className="font-bold" style={{ color: "#FBFAF9" }}>
                Reset Game
              </h4>
            </div>
          </div>
          <p className="text-sm mb-4" style={{ color: "rgba(251, 250, 249, 0.6)" }}>
            Start a new raffle round. Normal reset requires game to be closed first.
          </p>
          <div className="space-y-3">
            {!gameOpen ? (
              <button
                onClick={onResetGame}
                disabled={isResetting}
                className="w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-w3gg btn-primary-w3gg"
              >
                {isResetting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset Game</span>
                  </div>
                )}
              </button>
            ) : (
              <div
                className="text-center p-3 rounded-xl border mb-3"
                style={{
                  backgroundColor: "rgba(255, 107, 157, 0.1)",
                  borderColor: "rgba(255, 107, 157, 0.3)",
                }}
              >
                <div className="text-sm" style={{ color: "#FF6B9D" }}>
                  ⚠️ Close game first (pick winner)
                </div>
              </div>
            )}
            <button
              onClick={onEmergencyReset}
              disabled={isResetting}
              className="w-full font-bold py-3 px-6 rounded-xl border transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-30"
              style={{
                backgroundColor: "rgba(255, 107, 157, 0.15)",
                borderColor: "rgba(255, 107, 157, 0.4)",
                color: "#FF6B9D",
              }}
            >
              {isResetting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <RotateCcw className="w-5 h-5" />
                  <span>Emergency Reset (Cancel Game)</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div
        className="mt-6 p-4 rounded-xl border"
        style={{
          backgroundColor: "rgba(255, 107, 157, 0.1)",
          borderColor: "rgba(255, 107, 157, 0.3)",
        }}
      >
        <p className="text-xs text-center" style={{ color: "#FF6B9D" }}>
          ⚠️ <strong>Owner Access:</strong> These functions are restricted to the contract owner only.
          All actions are permanent and recorded on the blockchain.
        </p>
      </div>
    </div>
  )
}

export default AdminPanel
