"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { RAFFLE_ABI, RAFFLE_CONTRACT_ADDRESS, ERC20_ABI, USDC_ADDRESS } from "../constants"
import { waitForTransactionReceipt } from "@wagmi/core"
import { config } from "../App"
import GameBoard from "./GameBoard"
import GameControls from "./GameControls"
import GameStats from "./GameStats"
import GameHistory from "./GameHistory"
import AdminPanel from "./AdminPanel"
import type { RaffleInfo, PlayerEntry, RaffleEvent } from "../types/game"

const raffleContract = {
  address: RAFFLE_CONTRACT_ADDRESS as `0x${string}`,
  abi: RAFFLE_ABI,
}

const usdcContract = {
  address: USDC_ADDRESS as `0x${string}`,
  abi: ERC20_ABI,
}

const Container = () => {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [isLoading, setIsLoading] = useState(false)
  const [isPickingWinner, setIsPickingWinner] = useState(false)
  const [isFundingPrize, setIsFundingPrize] = useState(false)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [gameEvents, setGameEvents] = useState<RaffleEvent[]>([])
  const [playerEntries, setPlayerEntries] = useState<PlayerEntry[]>([])

  // Read game open status
  const { data: gameOpenData, refetch: refetchGameOpen } = useReadContract({
    ...raffleContract,
    functionName: "gameOpen",
    query: {
      enabled: isConnected,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  // Read player count
  const { data: playerCountData, refetch: refetchPlayerCount } = useReadContract({
    ...raffleContract,
    functionName: "getPlayerCount",
    query: {
      enabled: isConnected,
      refetchInterval: 5000,
    },
  })

  // Read prize pool
  const { data: prizePoolData, refetch: refetchPrizePool } = useReadContract({
    ...raffleContract,
    functionName: "getPrizePool",
    query: {
      enabled: isConnected,
      refetchInterval: 5000,
    },
  })

  // Read all players
  const { data: playersData, refetch: refetchPlayers } = useReadContract({
    ...raffleContract,
    functionName: "getPlayers",
    query: {
      enabled: isConnected,
      refetchInterval: 5000,
    },
  })

  // Read owner
  const { data: ownerData } = useReadContract({
    ...raffleContract,
    functionName: "owner",
    query: {
      enabled: isConnected,
    },
  })

  // Process raffle info
  const raffleInfo: RaffleInfo = {
    gameOpen: gameOpenData ? Boolean(gameOpenData) : true,
    playerCount: playerCountData ? Number(playerCountData) : 0,
    prizePool: prizePoolData ? BigInt(prizePoolData.toString()) : BigInt(0),
    owner: ownerData ? (ownerData as string) : "",
  }

  const isOwner = address && ownerData && address.toLowerCase() === (ownerData as string).toLowerCase()

  // Process player entries - count how many times each address appears
  useEffect(() => {
    if (playersData && Array.isArray(playersData)) {
      const entryCounts = new Map<string, number>()

      playersData.forEach((playerAddress: string) => {
        const count = entryCounts.get(playerAddress) || 0
        entryCounts.set(playerAddress, count + 1)
      })

      const entries: PlayerEntry[] = Array.from(entryCounts.entries()).map(([address, count]) => ({
        address,
        entryCount: count,
      }))

      setPlayerEntries(entries)
    }
  }, [playersData])

  // Watch for PlayerJoined event
  useWatchContractEvent({
    ...raffleContract,
    eventName: "PlayerJoined",
    onLogs(logs) {
      console.log("Player joined:", logs)
      refetchAll()

      const log = logs[0]
      if (log && "args" in log && log.args) {
        const args = log.args as { player: string }
        const { player } = args

        const newEvent: RaffleEvent = {
          type: "join",
          player: player,
          timestamp: Date.now(),
          transactionHash: log.transactionHash ?? undefined,
        }
        setGameEvents((prev) => [...prev, newEvent])

        toast.success(`Player joined: ${player.slice(0, 6)}...${player.slice(-4)}`, {
          style: {
            background: "rgba(32, 0, 82, 0.95)",
            color: "#FBFAF9",
            border: "1px solid rgba(131, 110, 249, 0.3)",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
        })
      }
    },
  })

  // Watch for WinnerPicked event
  useWatchContractEvent({
    ...raffleContract,
    eventName: "WinnerPicked",
    onLogs(logs) {
      console.log("Winner picked:", logs)
      refetchAll()

      const log = logs[0]
      if (log && "args" in log && log.args) {
        const args = log.args as { winner: string; prize: bigint }
        const { winner, prize } = args

        const newEvent: RaffleEvent = {
          type: "winner",
          winner: winner,
          amount: prize,
          timestamp: Date.now(),
          transactionHash: log.transactionHash ?? undefined,
        }
        setGameEvents((prev) => [...prev, newEvent])

        const prizeInUSDC = Number(prize) / 1_000_000 // Convert from 6 decimals

        toast.success(`🎉 Winner: ${winner.slice(0, 6)}...${winner.slice(-4)} won ${prizeInUSDC} USDC!`, {
          duration: 8000,
          style: {
            background: "rgba(32, 0, 82, 0.95)",
            color: "#FBFAF9",
            border: "1px solid rgba(131, 110, 249, 0.5)",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
        })
      }
    },
  })

  // Watch for PrizeFunded event
  useWatchContractEvent({
    ...raffleContract,
    eventName: "PrizeFunded",
    onLogs(logs) {
      console.log("Prize funded:", logs)
      refetchAll()

      const log = logs[0]
      if (log && "args" in log && log.args) {
        const args = log.args as { funder: string; amount: bigint }
        const { funder, amount } = args

        const newEvent: RaffleEvent = {
          type: "funded",
          player: funder,
          amount: amount,
          timestamp: Date.now(),
          transactionHash: log.transactionHash ?? undefined,
        }
        setGameEvents((prev) => [...prev, newEvent])

        const amountInUSDC = Number(amount) / 1_000_000

        toast.success(`Prize funded: ${amountInUSDC} USDC added by ${funder.slice(0, 6)}...${funder.slice(-4)}`, {
          style: {
            background: "rgba(32, 0, 82, 0.95)",
            color: "#FBFAF9",
            border: "1px solid rgba(131, 110, 249, 0.3)",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
        })
      }
    },
  })

  // Listen to PlayersAddedByAdmin events
  useWatchContractEvent({
    ...raffleContract,
    eventName: "PlayersAddedByAdmin",
    onLogs(logs) {
      console.log("Players added by admin:", logs)
      refetchAll()

      for (const log of logs) {
        const args = log.args as { players: `0x${string}`[]; admin: `0x${string}` }
        const { players, admin } = args

        const playerCount = players.length

        toast.success(
          playerCount === 1
            ? `Admin added 1 player: ${players[0].slice(0, 6)}...${players[0].slice(-4)}`
            : `Admin added ${playerCount} players to the raffle`,
          {
            style: {
              background: "rgba(32, 0, 82, 0.95)",
              color: "#FBFAF9",
              border: "1px solid rgba(131, 110, 249, 0.3)",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
            },
          }
        )
      }
    },
  })

  // Listen to GameReset events
  useWatchContractEvent({
    ...raffleContract,
    eventName: "GameReset",
    onLogs(logs) {
      console.log("Game reset:", logs)

      for (const log of logs) {
        const admin = log.args.admin as `0x${string}`
        const timestamp = log.args.timestamp as bigint

        toast.success(`Game has been reset by ${admin.slice(0, 6)}...${admin.slice(-4)}`, {
          style: {
            background: "rgba(32, 0, 82, 0.95)",
            color: "#FBFAF9",
            border: "1px solid rgba(131, 110, 249, 0.3)",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
        })
      }

      // Clear all data and refetch
      setGameEvents([])
      setPlayerEntries([])
      refetchAll()
    },
  })

  // Refetch all data
  const refetchAll = () => {
    refetchGameOpen()
    refetchPlayerCount()
    refetchPrizePool()
    refetchPlayers()
  }

  // Handle join game
  const handleJoinGame = async () => {
    if (!isConnected || !raffleInfo.gameOpen) return

    setIsLoading(true)

    toast.loading("Joining raffle...", {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        ...raffleContract,
        functionName: "joinGame",
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Confirming entry...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      const resultTransaction = await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      console.log("Join transaction confirmed:", resultTransaction)
      toast.dismiss()
      // Success toast will be handled by event listener
    } catch (error) {
      console.error("Join failed:", error)
      toast.dismiss()
      toast.error("Failed to join. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle pick winner (owner only)
  const handlePickWinner = async () => {
    if (!isConnected || !isOwner) return

    setIsPickingWinner(true)

    toast.loading("Picking winner...", {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        ...raffleContract,
        functionName: "pickWinner",
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Confirming winner selection...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      // Success toast will be handled by event listener
    } catch (error) {
      console.error("Pick winner failed:", error)
      toast.dismiss()
      toast.error("Failed to pick winner. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setIsPickingWinner(false)
    }
  }

  // Handle fund prize (owner only)
  const handleFundPrize = async (amount: number) => {
    if (!isConnected || !isOwner) return

    setIsFundingPrize(true)

    try {
      // Convert USDC amount to 6 decimals
      const amountInDecimals = BigInt(Math.floor(amount * 1_000_000))

      // Step 1: Approve USDC spending
      toast.loading("Approving USDC...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      const approveResult = await writeContractAsync({
        ...usdcContract,
        functionName: "approve",
        args: [RAFFLE_CONTRACT_ADDRESS, amountInDecimals],
        account: address as `0x${string}`,
      })

      await waitForTransactionReceipt(config, {
        hash: approveResult as `0x${string}`,
      })

      toast.dismiss()

      // Step 2: Fund prize
      toast.loading("Funding prize pool...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      const fundResult = await writeContractAsync({
        ...raffleContract,
        functionName: "fundPrize",
        args: [BigInt(amount)], // Contract expects the amount without decimals (will convert internally)
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Confirming funding...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: fundResult as `0x${string}`,
      })

      toast.dismiss()
      // Success toast will be handled by event listener
    } catch (error) {
      console.error("Fund prize failed:", error)
      toast.dismiss()
      toast.error("Failed to fund prize. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setIsFundingPrize(false)
    }
  }

  // Handle add player (owner only)
  const handleAddPlayer = async (playerAddress: string) => {
    if (!isConnected || !isOwner) return

    setIsAddingPlayer(true)

    toast.loading("Adding player...", {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        ...raffleContract,
        functionName: "addPlayer",
        args: [playerAddress as `0x${string}`],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Confirming player addition...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      toast.success(`Player ${playerAddress.slice(0, 6)}...${playerAddress.slice(-4)} added successfully!`, {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } catch (error) {
      console.error("Add player failed:", error)
      toast.dismiss()
      toast.error("Failed to add player. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setIsAddingPlayer(false)
    }
  }

  // Handle batch add players (owner only)
  const handleAddPlayersBatch = async (addresses: string[]) => {
    if (!isConnected || !isOwner) return

    setIsAddingPlayer(true)

    toast.loading(`Adding ${addresses.length} players...`, {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        ...raffleContract,
        functionName: "addPlayersBatch",
        args: [addresses as `0x${string}`[]],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Confirming batch addition...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      toast.success(`${addresses.length} players added successfully!`, {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } catch (error) {
      console.error("Batch add players failed:", error)
      toast.dismiss()
      toast.error("Failed to add players. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setIsAddingPlayer(false)
    }
  }

  // Handle reset game (owner only)
  const handleResetGame = async () => {
    if (!isConnected || !isOwner) return

    setIsResetting(true)

    toast.loading("Resetting game...", {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        ...raffleContract,
        functionName: "resetGame",
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Confirming reset...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      toast.success("Game reset successfully! Ready for new round.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } catch (error) {
      console.error("Reset game failed:", error)
      toast.dismiss()
      toast.error("Failed to reset game. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setIsResetting(false)
    }
  }

  // Handle emergency reset (owner only)
  const handleEmergencyReset = async () => {
    if (!isConnected || !isOwner) return

    // Add confirmation dialog
    const confirmed = window.confirm(
      "⚠️ EMERGENCY RESET\n\nThis will cancel the current game and reset all players.\nAre you sure you want to continue?"
    )

    if (!confirmed) return

    setIsResetting(true)

    toast.loading("Emergency reset in progress...", {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(160, 5, 93, 0.5)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        ...raffleContract,
        functionName: "emergencyReset",
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Confirming emergency reset...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      toast.success("Emergency reset complete. Game restarted.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(251, 204, 22, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } catch (error) {
      console.error("Emergency reset failed:", error)
      toast.dismiss()
      toast.error("Emergency reset failed. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <main className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {isConnected ? (
          <div className="space-y-8">
            <GameBoard raffleInfo={raffleInfo} />
            <GameControls
              onJoinGame={handleJoinGame}
              isConnected={isConnected}
              gameOpen={raffleInfo.gameOpen}
              isLoading={isLoading}
            />
            <GameStats
              raffleInfo={raffleInfo}
              playerEntries={playerEntries}
              isOwner={Boolean(isOwner)}
              onPickWinner={handlePickWinner}
              isPickingWinner={isPickingWinner}
            />
            <GameHistory events={gameEvents} playerEntries={playerEntries} />
            {isOwner && (
              <AdminPanel
                raffleInfo={raffleInfo}
                onPickWinner={handlePickWinner}
                onFundPrize={handleFundPrize}
                onAddPlayer={handleAddPlayer}
                onAddPlayersBatch={handleAddPlayersBatch}
                onResetGame={handleResetGame}
                onEmergencyReset={handleEmergencyReset}
                isPickingWinner={isPickingWinner}
                isFundingPrize={isFundingPrize}
                isAddingPlayer={isAddingPlayer}
                isResetting={isResetting}
              />
            )}
          </div>
        ) : (
          <div className="relative min-h-screen overflow-hidden particle-bg">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-yellow-600/20"></div>
            <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl float-slow"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl float-medium"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-yellow-400/5 to-transparent rounded-full"></div>

            {/* Live Badge */}
            <div className="absolute top-8 left-8 z-20 float-fast">
              <div className="live-badge sparkle">
                🔥&nbsp;&nbsp;BASE SEPOLIA LIVE!
              </div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen">
              <div className="text-center max-w-5xl mx-auto px-8 py-20">
              {/* Main Title */}
              <h1 className="hero-title text-gradient-primary mb-6 fade-in-up">
                <span className="block sm:inline">JOIN.&nbsp;PLAY.</span>
                <span className="block sm:inline">&nbsp;WIN.</span>
                <br />
                <span className="text-white text-reveal">WEB3 VIBE RAFFLE.</span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle text-gray-300 mb-12 max-w-3xl mx-auto fade-in-up-delay-1">
                The ultimate blockchain raffle game on Base Sepolia testnet.
                Join for free, multiply your chances, and win USDC prizes in the most exciting Web3 raffle experience.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 fade-in-up-delay-2">
                <ConnectButton.Custom>
                  {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="btn-w3gg btn-primary-w3gg btn-magnetic text-lg px-8 py-4 sparkle"
                              >
                                Connect Wallet & Join Raffle
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={openAccountModal}
                              className="btn-w3gg btn-primary-w3gg btn-magnetic text-lg px-8 py-4 sparkle"
                            >
                              {account.displayName}
                            </button>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
                <a
                  href="https://discord.gg/mFQDxfnJRZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-w3gg btn-secondary-w3gg interactive-hover text-lg px-8 py-4"
                >
                  Join Our Discord
                </a>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                {/* Free to Play */}
                <div className="glass-card p-8 text-center glow-hover fade-in-up-delay-1">
                  <div className="text-5xl mb-4 float-fast">🎫</div>
                  <h3 className="text-xl font-bold text-gradient-primary mb-3">FREE TO PLAY</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Join the raffle for free! No entry fee required. The more you join, the higher your chances to win.
                  </p>
                </div>

                {/* Win USDC */}
                <div className="glass-card p-8 text-center glow-hover fade-in-up-delay-2">
                  <div className="text-5xl mb-4 float-medium">💰</div>
                  <h3 className="text-xl font-bold text-gradient-primary mb-3">WIN USDC</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Real USDC prizes automatically sent to winners via smart contract. Instant, trustless, and transparent.
                  </p>
                </div>

                {/* Base Powered */}
                <div className="glass-card p-8 text-center glow-hover fade-in-up-delay-3">
                  <div className="text-5xl mb-4 float-slow">🚀</div>
                  <h3 className="text-xl font-bold text-gradient-primary mb-3">BASE POWERED</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Built on Base Sepolia for lightning-fast transactions and low gas fees. The future of Web3 gaming.
                  </p>
                </div>
              </div>

              {/* How It Works */}
              <div className="mt-16 fade-in-up-delay-3">
                <h3 className="text-2xl font-bold mb-8 text-gradient-primary">HOW IT WORKS</h3>
                <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
                  <div className="gradient-border glass-card p-6 scale-hover interactive-hover border-2 border-purple-500/30 hover:border-purple-400 sparkle max-w-xs">
                    <div className="text-4xl mb-3 float-medium">1️⃣</div>
                    <div className="text-purple-400 font-bold text-lg">CONNECT</div>
                    <div className="text-sm text-gray-400 mt-2">Connect your wallet to Base Sepolia</div>
                  </div>

                  <div className="text-2xl font-bold text-gradient-primary">→</div>

                  <div className="gradient-border glass-card p-6 scale-hover interactive-hover border-2 border-blue-500/30 hover:border-blue-400 sparkle max-w-xs">
                    <div className="text-4xl mb-3 float-medium">2️⃣</div>
                    <div className="text-blue-400 font-bold text-lg">JOIN</div>
                    <div className="text-sm text-gray-400 mt-2">Join as many times as you want (more entries = higher chance)</div>
                  </div>

                  <div className="text-2xl font-bold text-gradient-primary">→</div>

                  <div className="gradient-border glass-card p-6 scale-hover interactive-hover border-2 border-yellow-500/30 hover:border-yellow-400 sparkle max-w-xs">
                    <div className="text-4xl mb-3 float-medium">3️⃣</div>
                    <div className="text-yellow-400 font-bold text-lg">WIN!</div>
                    <div className="text-sm text-gray-400 mt-2">Smart contract picks winner & sends USDC automatically</div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Container
