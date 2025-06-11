"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface Player {
  id: number
  name: string
  avatar: string
  isAlive: boolean
  eliminatedAt?: number
}

interface DiamondGridProps {
  players: Player[]
  eliminatingPlayer: number | null
}

export function DiamondGrid({ players, eliminatingPlayer }: DiamondGridProps) {
  // Calculate grid dimensions based on viewport
  const [dimensions, setDimensions] = useState({
    columns: 8,
    size: 100,
    gap: 20,
  })

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setDimensions({ columns: 5, size: 80, gap: 15 })
      } else if (width < 1024) {
        setDimensions({ columns: 6, size: 90, gap: 18 })
      } else if (width < 1440) {
        setDimensions({ columns: 8, size: 100, gap: 20 })
      } else {
        setDimensions({ columns: 10, size: 110, gap: 25 })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Create staggered grid layout
  const rows = Math.ceil(100 / dimensions.columns)

  return (
    <div className="diamond-grid-container w-full overflow-hidden py-8">
      <div className="max-w-7xl mx-auto px-4">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const isEvenRow = rowIndex % 2 === 0
          const offset = isEvenRow ? 0 : (dimensions.size + dimensions.gap) / 2

          return (
            <div
              key={`row-${rowIndex}`}
              className="flex justify-center"
              style={{
                marginTop: rowIndex === 0 ? 0 : dimensions.gap / 2,
                marginLeft: offset,
              }}
            >
              {Array.from({ length: dimensions.columns }, (_, colIndex) => {
                const index = rowIndex * dimensions.columns + colIndex
                if (index >= 100) return null

                const playerId = index + 1
                const player = players.find((p) => p.id === playerId)
                const isEliminating = eliminatingPlayer === playerId

                return (
                  <motion.div
                    key={`diamond-${playerId}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: player?.isAlive === false ? "grayscale(100%)" : "grayscale(0%)",
                    }}
                    transition={{
                      delay: index * 0.02,
                      duration: 0.5,
                    }}
                    className="relative flex-shrink-0"
                    style={{
                      width: dimensions.size,
                      height: dimensions.size,
                      marginRight: dimensions.gap,
                    }}
                  >
                    {/* Diamond shape */}
                    <div
                      className={`absolute inset-2 transform rotate-45 border-2 transition-all duration-500 ${
                        player?.isAlive === false
                          ? "border-red-500 bg-red-900/30"
                          : player
                            ? "border-green-400 bg-pink-900/20"
                            : "border-gray-600 bg-gray-900/20"
                      } ${isEliminating ? "animate-pulse border-red-500 bg-red-500/50" : ""}`}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {player ? (
                        <>
                          <div
                            className="relative mb-2"
                            style={{
                              width: dimensions.size * 0.4,
                              height: dimensions.size * 0.4,
                            }}
                          >
                            <img
                              src={
                                player.avatar ||
                                `/placeholder.svg?height=${Math.floor(dimensions.size * 0.4)}&width=${Math.floor(dimensions.size * 0.4)}`
                              }
                              alt={player.name}
                              className={`w-full h-full object-cover rounded-full transition-all duration-500 ${
                                player.isAlive === false ? "opacity-60" : ""
                              } ${isEliminating ? "animate-bounce" : ""}`}
                            />
                          </div>
                          <div
                            className={`font-mono font-bold digital-font transition-all duration-500 ${
                              player.isAlive === false ? "text-red-500" : "text-green-400"
                            }`}
                            style={{
                              fontSize: `${dimensions.size * 0.12}px`,
                            }}
                          >
                            {playerId.toString().padStart(3, "0")}
                          </div>
                        </>
                      ) : (
                        <div
                          className="font-mono text-gray-600 digital-font"
                          style={{
                            fontSize: `${dimensions.size * 0.12}px`,
                          }}
                        >
                          {playerId.toString().padStart(3, "0")}
                        </div>
                      )}
                    </div>

                    {/* Elimination animation */}
                    {isEliminating && (
                      <motion.div
                        className="absolute inset-0 bg-red-500 opacity-50 transform rotate-45"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2 }}
                        transition={{ duration: 1, repeat: 2, repeatType: "reverse" }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
