"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Users, Settings, Eye, EyeOff } from "lucide-react"
import { DiamondGrid } from "@/components/diamond-grid"

interface Player {
  id: number
  playerNumber: number
  name: string
  avatar: string
  isEliminated: boolean
  eliminatedAt?: number
}

export default function SquidGameElimination() {
  const [mode, setMode] = useState<"select" | "player" | "operator" | "register">("select")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [operatorPin, setOperatorPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [eliminationTarget, setEliminationTarget] = useState("")
  const [newPlayerName, setNewPlayerName] = useState("")
  const [eliminatingPlayer, setEliminatingPlayer] = useState<number | null>(null)

  // Load data from API and check local storage on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data);

        // Check if there's a saved player in localStorage
        const savedCurrentPlayer = localStorage.getItem("squidGameCurrentPlayer")
        if (savedCurrentPlayer) {
          const parsedPlayer = JSON.parse(savedCurrentPlayer)
          // Verify the player still exists in the database
          const playerExists = data.some((p: Player) => p.id === parsedPlayer.id)
          if (playerExists) {
            setCurrentPlayer(parsedPlayer)
            setMode("player")
          } else {
            // If player no longer exists in database, clear localStorage
            localStorage.removeItem("squidGameCurrentPlayer")
          }
        }
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };

    fetchPlayers();
  }, []);

  // Add SSE subscription for live eliminations
  useEffect(() => {
    const eventSource = new EventSource('/api/eliminations');
    eventSource.onmessage = (event) => {
      const { playerNumber } = JSON.parse(event.data);
      setPlayers(prev =>
        prev.map(p =>
          p.playerNumber === playerNumber
            ? { ...p, isEliminated: true, eliminatedAt: Date.now() }
            : p
        )
      );
    };
    return () => eventSource.close();
  }, []);

  const registerPlayer = async () => {
    if (!newPlayerName.trim()) return

    try {
      const response = await fetch('/api/players');
      const allPlayers = await response.json();
      const player = allPlayers.find((p: Player) => p.name.toLowerCase() === newPlayerName.trim().toLowerCase());
      
      if (!player) {
        alert('Player not found. Please check your username.');
        return;
      }

      setCurrentPlayer(player);
      localStorage.setItem("squidGameCurrentPlayer", JSON.stringify(player));
      setMode("player");
    } catch (error) {
      console.error('Failed to find player:', error);
      alert('Failed to find player. Please try again.');
    }
  }

  const handleOperatorLogin = () => {
    if (operatorPin === "1357") {
      setMode("operator")
      setOperatorPin("")
    } else {
      alert("Invalid PIN")
      setOperatorPin("")
    }
  }

  const eliminatePlayer = async () => {
    const playerNumber = Number.parseInt(eliminationTarget)
    if (isNaN(playerNumber) || playerNumber < 1 || playerNumber > 100) {
      alert("Please enter a valid player number (1-100)")
      return
    }

    const playerToEliminate = players.find((p) => p.playerNumber === playerNumber)
    if (!playerToEliminate) {
      alert("Player not found")
      return
    }

    if (playerToEliminate.isEliminated) {
      alert("Player is already eliminated")
      return
    }

    // Start elimination animation
    setEliminatingPlayer(playerNumber)

    try {
      const response = await fetch('/api/players', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerNumber }),
      });

      const updatedPlayer = await response.json();
      setPlayers(prev =>
        prev.map(p =>
          p.playerNumber === playerNumber
            ? { ...p, isEliminated: true, eliminatedAt: Date.now() }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to eliminate player:', error);
      alert('Failed to eliminate player. Please try again.');
    } finally {
      setTimeout(() => {
        setEliminatingPlayer(null);
        setEliminationTarget("");
      }, 2000);
    }
  }

  const alivePlayers = players.filter((p) => !p.isEliminated)
  const eliminatedCount = players.filter((p) => p.isEliminated).length

  if (mode === "select") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-green-400 digital-font tracking-wider mb-12">SQUID GAME</h1>
          <div className="space-y-4">
            <Button
              onClick={() => {
                // If there's a saved player, go directly to player mode
                const savedPlayer = localStorage.getItem("squidGameCurrentPlayer")
                if (savedPlayer) {
                  setCurrentPlayer(JSON.parse(savedPlayer))
                  setMode("player")
                } else {
                  setMode("register")
                }
              }}
              className="w-64 h-16 text-xl bg-green-600 hover:bg-green-700 text-black font-bold"
            >
              <Users className="mr-2" />
              PLAYER MODE
            </Button>
            <Button
              onClick={() => setMode("operator")}
              className="w-64 h-16 text-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              <Settings className="mr-2" />
              OPERATOR MODE
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "register") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-96 p-6 bg-gray-900 border-green-400">
          <h2 className="text-2xl font-bold text-green-400 text-center mb-6 digital-font">PLAYER LOGIN</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 mb-2 digital-font">Username:</label>
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="bg-black border-green-400 text-green-400"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={registerPlayer}
                disabled={!newPlayerName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-black font-bold"
              >
                JOIN GAME
              </Button>
              <Button
                onClick={() => setMode("select")}
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-400/10"
              >
                BACK
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (mode === "operator" && operatorPin !== "1357") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-96 p-6 bg-gray-900 border-red-400">
          <h2 className="text-2xl font-bold text-red-400 text-center mb-6 digital-font">OPERATOR ACCESS</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-red-400 mb-2 digital-font">Enter PIN:</label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  value={operatorPin}
                  onChange={(e) => setOperatorPin(e.target.value)}
                  className="bg-black border-red-400 text-red-400 pr-10"
                  placeholder="****"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-400"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleOperatorLogin} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold">
                ACCESS
              </Button>
              <Button
                onClick={() => setMode("select")}
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                BACK
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          <div className="text-4xl font-bold digital-font">{eliminatedCount.toString().padStart(3, "0")}</div>
          <div className="text-sm digital-font">ELIMINATION COUNTER</div>
        </div>

        <h1 className="text-3xl font-bold digital-font text-center">SQUID GAME ELIMINATION</h1>

        <div className="text-right">
          <div className="text-2xl font-bold digital-font">{alivePlayers.length.toString().padStart(3, "0")}</div>
          <div className="text-sm digital-font">PLAYERS ALIVE</div>
        </div>
      </div>

      {/* Operator Controls */}
      {mode === "operator" && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-400 rounded">
          <h3 className="text-xl font-bold text-red-400 mb-4 digital-font">OPERATOR CONTROLS</h3>
          <div className="flex space-x-4 items-end">
            <div>
              <label className="block text-red-400 mb-2 digital-font">Player Number (1-100):</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={eliminationTarget}
                onChange={(e) => setEliminationTarget(e.target.value)}
                className="w-32 bg-black border-red-400 text-red-400"
                placeholder="001"
              />
            </div>
            <Button
              onClick={eliminatePlayer}
              disabled={!eliminationTarget || eliminatingPlayer !== null}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              ELIMINATE
            </Button>
            <Button
              onClick={() => setMode("select")}
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-400/10"
            >
              EXIT
            </Button>
          </div>
        </div>
      )}

      {/* Player Mode Controls */}
      {mode === "player" && (
        <div className="mb-6 flex justify-between items-center">
          <div className="text-green-400 digital-font">
            Welcome, {currentPlayer?.name} (#{currentPlayer?.playerNumber.toString().padStart(3, "0")})
          </div>
          <Button
            onClick={() => {
              setCurrentPlayer(null)
              localStorage.removeItem("squidGameCurrentPlayer")
              setMode("select")
            }}
            variant="outline"
            className="border-green-400 text-green-400 hover:bg-green-400/10"
          >
            EXIT
          </Button>
        </div>
      )}

      {/* Diamond Grid Component */}
      <DiamondGrid players={players} eliminatingPlayer={eliminatingPlayer} />

      {/* Footer Stats */}
      <div className="mt-8 text-center digital-font text-sm text-green-400/70">
        Total Players: {players.length} | Alive: {alivePlayers.length} | Eliminated: {eliminatedCount}
      </div>
    </div>
  )
}
