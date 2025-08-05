"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { X, Minus, Sun, Moon } from "lucide-react"

interface WindowState {
  id: string
  title: string
  isOpen: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  content: React.ReactNode
}

interface DesktopIcon {
  id: string
  title: string
  icon: string
  position: { x: number; y: number }
}

type Theme = "light" | "dark"

export default function RetroPortfolio() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [highestZIndex, setHighestZIndex] = useState(1)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [draggedWindow, setDraggedWindow] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [theme, setTheme] = useState<Theme>("dark") // Default to dark mode

  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([])

  // Add a hook to detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  useEffect(() => {
    const baseY = isMobile ? 80 : window.innerHeight - 180
    const icons: DesktopIcon[] = [
      { id: "about", title: "About Me", icon: "👤", position: { x: isMobile ? 20 : 200, y: baseY } },
      { id: "projects", title: "Projects", icon: "💻", position: { x: isMobile ? 120 : 350, y: baseY } },
      { id: "contact", title: "Contact", icon: "📧", position: { x: isMobile ? 220 : 500, y: baseY } },
      { id: "resume", title: "Resume", icon: "📄", position: { x: isMobile ? 320 : 650, y: baseY } },
    ]
    setDesktopIcons(icons)
  }, [isMobile])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"))
  }, [])

  const openWindow = (iconId: string) => {
    const existingWindow = windows.find((w) => w.id === iconId)
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        setWindows((prev) =>
          prev.map((w) => (w.id === iconId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w)),
        )
        setHighestZIndex((prev) => prev + 1)
      } else {
        bringToFront(iconId)
      }
      return
    }

    const newWindow: WindowState = {
      id: iconId,
      title: desktopIcons.find((icon) => icon.id === iconId)?.title || "",
      isOpen: true,
      isMinimized: false,
      position: isMobile
        ? { x: 0, y: 0 }
        : { x: 200 + windows.length * 30, y: 150 + windows.length * 30 },
      size: isMobile
        ? { width: window.innerWidth, height: window.innerHeight - 64 }
        : { width: 700, height: 500 },
      zIndex: highestZIndex + 1,
      content: getWindowContent(iconId),
    }

    setWindows((prev) => [...prev, newWindow])
    setHighestZIndex((prev) => prev + 1)
  }

  const closeWindow = (windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
  }

  const minimizeWindow = (windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w)))
  }

  const bringToFront = (windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, zIndex: highestZIndex + 1 } : w)))
    setHighestZIndex((prev) => prev + 1)
  }

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    if (isMobile) return
    const window = windows.find((w) => w.id === windowId)
    if (!window) return

    setDraggedWindow(windowId)
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    })
    bringToFront(windowId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedWindow) return

    const taskbarHeight = 64 // Corresponds to h-16 in Tailwind CSS
    setWindows((prev) =>
      prev.map((w) =>
        w.id === draggedWindow
          ? {
              ...w,
              position: {
                x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - w.size.width)),
                y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - w.size.height - taskbarHeight)),
              },
            }
          : w,
      ),
    )
  }

  const handleMouseUp = () => {
    setDraggedWindow(null)
  }

  const getWindowContent = (windowId: string) => {
    // Remove theme-based Tailwind text color classes
    // Use the global .text-foreground class for all text
    switch (windowId) {
      case "about":
        return (
          <div className="p-6 h-full overflow-auto retro-text text-foreground">
            <h2 className="text-2xl font-bold mb-4 text-foreground">👤 About Me</h2>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-foreground">
                Hi, I'm <span className="font-bold">Nostalgic Dev</span>!
              </p>
              <p className="text-base text-foreground">
                🚀 I build fun, interactive web experiences with a love for{" "}
                <span className="font-bold">retro aesthetics</span> and pixel art.
              </p>
              <p className="text-base text-foreground">
                🎶 When not coding, I’m listening to lofi beats, drawing pixel sprites, or exploring vintage tech.
              </p>
              <div className="mt-6 p-4 rounded-lg border-2 shadow-lg">
                <p className="font-bold text-foreground">Skills:</p>
                <ul className="list-disc ml-6 text-foreground">
                  <li>JavaScript, React, TypeScript</li>
                  <li>Node.js, Python</li>
                  <li>CSS, Canvas API</li>
                </ul>
                <p className="font-bold mt-2 text-foreground">Interests:</p>
                <ul className="list-disc ml-6 text-foreground">
                  <li>Retro Computing</li>
                  <li>Lofi Music</li>
                  <li>Pixel Art & Sprites</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case "projects":
        return (
          <div className="p-6 h-full overflow-auto retro-text text-foreground">
            <h2 className="text-2xl font-bold mb-4 text-foreground">💻 Projects</h2>
            <div className="space-y-4">
              <div className="mt-6 p-4 rounded-lg border-2 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-2">Retro Music Player</h3>
                <p className="text-base text-foreground font-semibold">
                  A nostalgic music player with cassette tape aesthetics
                </p>
                <p className="text-xs mt-2 text-foreground">Tech: React, Web Audio API</p>
              </div>
              <div className="mt-6 p-4 rounded-lg border-2 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-2">Pixel Art Generator</h3>
                <p className="text-base text-foreground font-semibold">
                  Tool for creating retro-style pixel art and sprites
                </p>
                <p className="text-xs mt-2 text-foreground">Tech: Canvas API, JavaScript</p>
              </div>
              <div className="mt-6 p-4 rounded-lg border-2 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-2">Terminal Portfolio</h3>
                <p className="text-base text-foreground font-semibold">
                  Interactive command-line interface portfolio
                </p>
                <p className="text-xs mt-2 text-foreground">Tech: React, TypeScript</p>
              </div>
            </div>
          </div>
        )
      case "contact":
        return (
          <div className="p-6 h-full overflow-auto retro-text text-foreground">
            <h2 className="text-2xl font-bold mb-4 text-foreground">📧 Contact</h2>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-foreground">Let’s connect! Reach out via your favorite channel:</p>
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3">
                  <span className="text-foreground">📧</span>
                  <span className="font-bold text-foreground">hello@retrodev.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-foreground">🐙</span>
                  <span className="font-bold text-foreground">github.com/retrodev</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-foreground">💼</span>
                  <span className="font-bold text-foreground">linkedin.com/in/retrodev</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-foreground">🐦</span>
                  <span className="font-bold text-foreground">@retrodev_codes</span>
                </div>
              </div>
              <div className="mt-8 p-4 rounded-lg border-2 shadow-lg">
                <p className="text-base font-bold text-foreground">Status: Available for freelance projects</p>
                <p className="text-base font-bold text-foreground">Response time: Usually within 24 hours</p>
              </div>
            </div>
          </div>
        )
      case "resume":
        return (
          <div className="p-6 h-full overflow-auto retro-text text-foreground">
            <h2 className="text-2xl font-bold mb-4 text-foreground">📄 Resume</h2>
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-bold text-foreground mb-2">💼 Experience</h3>
                <div className="space-y-4">
                  <div className={`border-l-4 pl-4`}>
                    <h4 className="font-bold text-foreground">Senior Frontend Developer</h4>
                    <p className="text-sm text-foreground">RetroTech Solutions • 2022-Present</p>
                    <p className="text-sm mt-1 text-foreground">Building modern web apps with vintage aesthetics and pixel-perfect UI.</p>
                  </div>
                  <div className={`border-l-4 pl-4`}>
                    <h4 className="font-bold text-foreground">Full Stack Developer</h4>
                    <p className="text-sm text-foreground">Digital Nostalgia Inc • 2020-2022</p>
                    <p className="text-sm mt-1 text-foreground">Developed retro-inspired web applications and interactive experiences.</p>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-lg font-bold text-foreground mb-2">🎓 Education</h3>
                <div className={`border-l-4 pl-4`}>
                  <h4 className="font-bold text-foreground">Computer Science Degree</h4>
                  <p className="text-sm text-foreground">Retro University • 2016-2020</p>
                </div>
              </section>
            </div>
          </div>
        )
      default:
        return <div className="p-6 text-foreground">Content not found</div>
    }
  }

  return (
    <div
      className={`h-screen w-full relative overflow-hidden cursor-crosshair pixel-desktop ${theme} ${isMobile ? "mobile" : ""}`}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseUp={isMobile ? undefined : handleMouseUp}
    >
      {/* Pixel Art Desktop Background */}
      <div className="absolute inset-0 pixel-bg">
        {/* Sky gradient */}
        <div
          className={`absolute inset-0 ${theme === "dark" ? "bg-gradient-to-b from-pink-300 via-purple-400 to-indigo-500" : "bg-gradient-to-b from-blue-100 via-yellow-100 to-pink-100"}`}
        ></div>

        {/* Pixel clouds */}
        <div className="pixel-cloud" style={{ left: "10%", top: "15%" }}>
          <div className={`cloud-pixel ${theme === "dark" ? "bg-pink-100" : "bg-gray-100"}`}></div>
          <div className={`cloud-pixel ${theme === "dark" ? "bg-pink-200" : "bg-gray-200"}`}></div>
          <div className={`cloud-pixel ${theme === "dark" ? "bg-white" : "bg-white"}`}></div>
        </div>
        <div className="pixel-cloud" style={{ left: "70%", top: "10%" }}>
          <div className={`cloud-pixel ${theme === "dark" ? "bg-pink-100" : "bg-gray-100"}`}></div>
          <div className={`cloud-pixel ${theme === "dark" ? "bg-pink-200" : "bg-gray-200"}`}></div>
          <div className={`cloud-pixel ${theme === "dark" ? "bg-white" : "bg-white"}`}></div>
        </div>

        {/* Pixel Mountains */}
        <div className="pixel-mountains">
          <div className={`mountain-layer-1 ${theme}`}></div>
          <div className={`mountain-layer-2 ${theme}`}></div>
          <div className={`mountain-layer-3 ${theme}`}></div>
        </div>

        {/* Pixel Ground/grass */}
        <div className="pixel-ground">
          <div className={`grass-layer ${theme}`}></div>
          <div className={`dirt-layer ${theme}`}></div>
        </div>

        {/* Pixel Trees */}
        <div className="pixel-tree" style={{ left: "5%", bottom: "120px" }}>
          <div className={`tree-trunk ${theme}`}></div>
          <div className={`tree-leaves ${theme}`}></div>
        </div>
        <div className="pixel-tree" style={{ left: "85%", bottom: "120px" }}>
          <div className={`tree-trunk ${theme}`}></div>
          <div className={`tree-leaves ${theme}`}></div>
        </div>

        {/* Pixel Flowers */}
        <div className="pixel-flower" style={{ left: "15%", bottom: "100px" }}>
          <div className={`flower-stem ${theme}`}></div>
          <div className={`flower-bloom ${theme}`}></div>
        </div>
        <div className="pixel-flower" style={{ left: "75%", bottom: "100px" }}>
          <div className={`flower-stem ${theme}`}></div>
          <div className={`flower-bloom ${theme}`}></div>
        </div>

        {/* Pixel Sun */}
        <div className="pixel-sun">
          <div className="sun-core"></div>
          <div className="sun-ray sun-ray-1"></div>
          <div className="sun-ray sun-ray-2"></div>
          <div className="sun-ray sun-ray-3"></div>
          <div className="sun-ray sun-ray-4"></div>
        </div>

        {/* Floating pixel hearts */}
        <div className="floating-pixel-heart" style={{ left: "20%", top: "30%" }}>
          💖
        </div>
        <div className="floating-pixel-heart" style={{ left: "80%", top: "40%" }}>
          💕
        </div>
        <div className="floating-pixel-heart" style={{ left: "60%", top: "25%" }}>
          💗
        </div>
      </div>

      {/* Desktop Icons */}
      <div className={`absolute ${isMobile ? "w-full flex flex-col items-start gap-2 top-2 left-0" : ""}`}>
        {desktopIcons.map((icon, index) => (
          <div
            key={icon.id}
            className={`absolute flex flex-col items-center cursor-pointer p-4 rounded-lg transition-all duration-300 desktop-icon pixel-border hover:scale-110 ${theme === "dark" ? "hover:bg-pink-500/20" : "hover:bg-purple-200/50"} ${isMobile ? "static" : ""}`}
            style={isMobile ? { width: "100vw" } : {
              left: icon.position.x,
              top: icon.position.y,
              animationDelay: `${index * 0.3}s`,
            }}
            onClick={() => openWindow(icon.id)}
          >
            <div className={`pixel-icon-frame ${theme}`}>
              <div
                className={`text-6xl mb-3 pixel-icon drop-shadow-lg hover:animate-bounce ${theme === "dark" ? "text-pink-100" : "text-purple-800"}`}
                style={{
                  filter:
                    theme === "dark"
                      ? "drop-shadow(4px 4px 0px rgba(255,20,147,0.8))"
                      : "drop-shadow(4px 4px 0px rgba(0,0,0,0.4))",
                }}
              >
                {icon.icon}
              </div>
            </div>
            <span
              className={`text-sm font-mono text-center px-3 py-2 rounded-lg border-2 pixel-text backdrop-blur-sm font-bold ${theme === "dark" ? "text-pink-950 bg-pink-100/95 border-pink-500" : "text-purple-950 bg-purple-100/95 border-purple-500"}`}
            >
              {icon.title}
            </span>
          </div>
        ))}
      </div>

      {/* Windows */}
      {windows
        .filter((w) => w.isOpen && !w.isMinimized)
        .map((window) => (
          <div
            key={window.id}
            className={`absolute border-4 rounded-none shadow-2xl window pixel-window ${theme === "dark" ? "bg-gray-950 border-pink-500" : "bg-white border-purple-500"} ${isMobile ? "mobile-window" : ""}`}
            style={{
              left: isMobile ? 0 : window.position.x,
              top: isMobile ? 0 : window.position.y,
              width: isMobile ? "100vw" : window.size.width,
              height: isMobile ? `calc(100vh - 64px)` : window.size.height,
              zIndex: window.zIndex,
              boxShadow:
                theme === "dark"
                  ? `
  6px 6px 0px rgba(255,20,147,0.6),
  12px 12px 0px rgba(0,0,0,0.4)
`
                  : `
  6px 6px 0px rgba(128,0,128,0.6),
  12px 12px 0px rgba(0,0,0,0.4)
`,
            }}
            onClick={() => bringToFront(window.id)}
          >
            {/* Title Bar */}
            <div
              className={`px-4 py-3 flex items-center justify-between cursor-move border-b-4 title-bar pixel-title ${theme === "dark" ? "bg-gradient-to-r from-pink-700 to-purple-800 border-pink-500 text-white" : "bg-gradient-to-r from-purple-600 to-blue-700 border-purple-500 text-white"}`}
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              <span className="font-mono text-sm font-bold pixel-text drop-shadow-lg">{window.title}</span>
              <div className="flex gap-2">
                <button
                  className={`w-8 h-8 bg-yellow-400 hover:bg-yellow-300 rounded-none flex items-center justify-center transition-colors border-2 pixel-button ${theme === "dark" ? "border-yellow-700 text-black" : "border-yellow-700 text-black"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    minimizeWindow(window.id)
                  }}
                >
                  <Minus size={16} />
                </button>
                <button
                  className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors border-2 pixel-button ${theme === "dark" ? "bg-pink-600 hover:bg-pink-500 border-pink-800 text-white" : "bg-red-600 hover:bg-red-500 border-red-800 text-white"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    closeWindow(window.id)
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div
              className={`pixel-content ${window.id === "projects" ? "projects-scrollbar" : ""} ${theme}`}
              style={{
                boxSizing: "border-box",
                paddingRight: isMobile ? "8px" : "20px",
                height: isMobile ? "calc(100vh - 128px)" : "432px",
                overflowY: "auto",
              }}
            >
              {window.content}
            </div>
          </div>
        ))}

      {/* Pixel Art Taskbar */}
      <div className={`absolute bottom-0 left-0 right-0 h-16 flex items-center px-4 pixel-taskbar ${theme}`}>
        <div className="taskbar-bg"></div>
        <div className="flex items-center gap-3 relative z-10 w-full">
          <div
            className={`px-4 py-2 rounded-none text-white font-mono text-sm cursor-pointer transition-colors border-2 pixel-button font-bold ${theme === "dark" ? "bg-pink-700 hover:bg-pink-600 border-pink-500" : "bg-purple-700 hover:bg-purple-600 border-purple-500"}`}
          >
            START
          </div>

          {/* Minimized Windows */}
          <div className="flex gap-2 ml-4 flex-grow overflow-hidden">
            {windows
              .filter((w) => w.isMinimized)
              .map((window) => (
                <button
                  key={window.id}
                  className={`px-3 py-2 rounded-none font-mono text-xs transition-colors border-2 pixel-button whitespace-nowrap ${theme === "dark" ? "bg-purple-800 hover:bg-purple-700 text-pink-100 border-pink-500/60" : "bg-blue-400 hover:bg-blue-300 text-purple-900 border-blue-500/60"}`}
                  onClick={() => openWindow(window.id)}
                >
                  {window.title}
                </button>
              ))}
          </div>

          {/* Theme Toggle Button */}
          <button
            className={`ml-auto mr-4 w-10 h-10 rounded-none flex items-center justify-center transition-colors border-2 pixel-button ${theme === "dark" ? "bg-pink-950 hover:bg-pink-900 border-pink-500 text-pink-100" : "bg-purple-300 hover:bg-purple-200 border-purple-500 text-purple-900"}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Pixel Clock */}
          <div className="relative z-10">
            <div className={`pixel-clock ${theme}`}>
              <div className="clock-bg"></div>
              <span
                className={`font-mono text-sm font-bold relative z-10 ${theme === "dark" ? "text-pink-950" : "text-purple-950"}`}
              >
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CRT Effect Overlay */}
      <div className={`absolute inset-0 pointer-events-none ${theme}`}>
        <div className={`crt-lines ${theme}`}></div>
        <div className={`crt-flicker ${theme}`}></div>
      </div>

      <style jsx>{`
        .pixel-desktop {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-crisp-edges;
          image-rendering: crisp-edges;
        }

        .pixel-bg {
          image-rendering: pixelated;
        }

        /* Pixel Clouds */
        .pixel-cloud {
          position: absolute;
          display: flex;
          gap: 4px;
          animation: cloudFloat 12s ease-in-out infinite;
        }

        .cloud-pixel {
          width: 16px;
          height: 16px;
          image-rendering: pixelated;
        }

        /* Pixel Mountains */
        .pixel-mountains {
          position: absolute;
          bottom: 200px;
          left: 0;
          right: 0;
          height: 200px;
        }

        .mountain-layer-1 {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          clip-path: polygon(0% 100%, 20% 60%, 40% 80%, 60% 40%, 80% 70%, 100% 100%);
          image-rendering: pixelated;
        }
        .mountain-layer-1.dark {
          background: linear-gradient(45deg, #8b5cf6 0%, #a855f7 50%, #9333ea 100%);
        }
        .mountain-layer-1.light {
          background: linear-gradient(45deg, #a78bfa 0%, #c4b5fd 50%, #8b5cf6 100%);
        }

        .mountain-layer-2 {
          position: absolute;
          bottom: 40px;
          left: 10%;
          right: 10%;
          height: 100px;
          clip-path: polygon(0% 100%, 30% 30%, 50% 60%, 70% 20%, 100% 100%);
          image-rendering: pixelated;
        }
        .mountain-layer-2.dark {
          background: linear-gradient(45deg, #ec4899 0%, #f472b6 50%, #e879f9 100%);
        }
        .mountain-layer-2.light {
          background: linear-gradient(45deg, #fbcfe8 0%, #f9a8d4 50%, #f472b6 100%);
        }

        .mountain-layer-3 {
          position: absolute;
          bottom: 60px;
          left: 30%;
          right: 30%;
          height: 80px;
          clip-path: polygon(0% 100%, 40% 40%, 60% 60%, 100% 100%);
          image-rendering: pixelated;
        }
        .mountain-layer-3.dark {
          background: linear-gradient(45deg, #f97316 0%, #fb923c 50%, #fdba74 100%);
        }
        .mountain-layer-3.light {
          background: linear-gradient(45deg, #fcd34d 0%, #fde68a 50%, #fcd34d 100%);
        }

        /* Pixel Ground */
        .pixel-ground {
          position: absolute;
          bottom: 120px;
          left: 0;
          right: 0;
          height: 60px;
          image-rendering: pixelated;
        }

        .grass-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 20px;
          background-image: 
            repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 12px);
          image-rendering: pixelated;
        }
        .grass-layer.dark {
          background: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
        }
        .grass-layer.light {
          background: linear-gradient(90deg, #86efac 0%, #4ade80 50%, #22c55e 100%);
        }

        .dirt-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          image-rendering: pixelated;
        }
        .dirt-layer.dark {
          background: linear-gradient(90deg, #92400e 0%, #a16207 50%, #ca8a04 100%);
        }
        .dirt-layer.light {
          background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #fcd34d 100%);
        }

        /* Pixel Trees */
        .pixel-tree {
          position: absolute;
          width: 40px;
          height: 80px;
          image-rendering: pixelated;
        }

        .tree-trunk {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 40px;
          image-rendering: pixelated;
        }
        .tree-trunk.dark { background: #92400e; }
        .tree-trunk.light { background: #a16207; }

        .tree-leaves {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          image-rendering: pixelated;
        }
        .tree-leaves.dark { background: #16a34a; }
        .tree-leaves.light { background: #4ade80; }

        /* Pixel Flowers */
        .pixel-flower {
          position: absolute;
          width: 8px;
          height: 24px;
          image-rendering: pixelated;
        }

        .flower-stem {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 16px;
          image-rendering: pixelated;
        }
        .flower-stem.dark { background: #16a34a; }
        .flower-stem.light { background: #4ade80; }

        .flower-bloom {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: #ec4899; /* Pink remains constant */
          border-radius: 50%;
          image-rendering: pixelated;
        }

        /* Pixel Sun */
        .pixel-sun {
          position: absolute;
          top: 8%;
          right: 10%;
          width: 60px;
          height: 60px;
          image-rendering: pixelated;
        }

        .sun-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          background: #fbbf24;
          border-radius: 50%;
          animation: sunGlow 4s ease-in-out infinite;
          image-rendering: pixelated;
        }

        .sun-ray {
          position: absolute;
          background: #fbbf24;
          width: 4px;
          height: 12px;
          top: 50%;
          left: 50%;
          transform-origin: center;
          image-rendering: pixelated;
        }

        .sun-ray-1 { transform: translate(-50%, -50%) rotate(0deg) translateY(-24px); }
        .sun-ray-2 { transform: translate(-50%, -50%) rotate(90deg) translateY(-24px); }
        .sun-ray-3 { transform: translate(-50%, -50%) rotate(180deg) translateY(-24px); }
        .sun-ray-4 { transform: translate(-50%, -50%) rotate(270deg) translateY(-24px); }

        /* Pixel Taskbar */
        .pixel-taskbar {
          position: relative;
          image-rendering: pixelated;
        }

        .taskbar-bg {
          position: absolute;
          inset: 0;
          border-top: 4px solid;
          image-rendering: pixelated;
        }
        .pixel-taskbar.dark .taskbar-bg {
          background: linear-gradient(180deg, #a0a0a0 0%, #707070 50%, #404040 100%);
          border-color: #c0c0c0;
        }
        .pixel-taskbar.light .taskbar-bg {
          background: linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 50%, #b0b0b0 100%);
          border-color: #ffffff;
        }

        /* Pixel Clock */
        .pixel-clock {
          position: relative;
          padding: 8px 12px;
          image-rendering: pixelated;
        }

        .clock-bg {
          position: absolute;
          inset: 0;
          border: 2px solid;
          border-radius: 4px;
          image-rendering: pixelated;
        }
        .pixel-clock.dark .clock-bg {
          background: #e0e0e0;
          border-color: #222;
        }
        .pixel-clock.light .clock-bg {
          background: #f0f0f0;
          border-color: #555;
        }

        /* Icon Frame */
        .pixel-icon-frame {
          position: relative;
          padding: 8px;
          border: 2px solid;
          backdrop-filter: blur(4px);
          image-rendering: pixelated;
        }
        .pixel-icon-frame.dark {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 20, 147, 0.5);
        }
        .pixel-icon-frame.light {
          background: rgba(0, 0, 0, 0.1);
          border-color: rgba(128, 0, 128, 0.5);
        }

        /* Floating Elements */
        .floating-pixel-heart {
          position: absolute;
          font-size: 1.5rem;
          animation: pixelHeartFloat 8s ease-in-out infinite;
          opacity: 0.8;
          filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3));
          image-rendering: pixelated;
        }

        /* Desktop Icon */
        .desktop-icon {
          animation: iconBob 3s ease-in-out infinite;
          image-rendering: pixelated;
        }

        .desktop-icon:nth-child(2) { animation-delay: 0.5s; }
        .desktop-icon:nth-child(3) { animation-delay: 1s; }
        .desktop-icon:nth-child(4) { animation-delay: 1.5s; }

        /* Pixel styling */
        .pixel-icon, .pixel-text, .pixel-button, .pixel-window, .pixel-title, .pixel-content {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-crisp-edges;
          image-rendering: crisp-edges;
        }

        .pixel-button {
          box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
        }

        .pixel-button:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px rgba(0,0,0,0.3);
        }

        .retro-text {
          font-family: 'Courier New', monospace;
          image-rendering: pixelated;
        }
        .retro-text.dark {
          text-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
        }
        .retro-text.light {
          text-shadow: 0 0 10px rgba(128, 0, 128, 0.5);
        }

        .window {
          image-rendering: pixelated;
          box-sizing: border-box; /* Ensure border-box model for the window itself */
        }
        .pixel-window.dark {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%);
        }
        .pixel-window.light {
          background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
        }

        .pixel-title {
          image-rendering: pixelated;
          text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
        }

        .pixel-content {
          image-rendering: pixelated;
          /* The padding-right is now applied via inline style in JSX for better control */
        }
        .pixel-content.dark {
          background: linear-gradient(180deg, #111111 0%, #221122 100%); /* Darker dark mode background */
        }
        .pixel-content.light {
          background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
        }

        /* Custom Scrollbar Design */
        .pixel-content::-webkit-scrollbar {
          width: 12px;
          height: 12px;
          image-rendering: pixelated;
        }

        .pixel-content::-webkit-scrollbar-track {
          background: #222; /* Darker track for dark mode */
          border: 2px solid #444;
          image-rendering: pixelated;
        }
        .pixel-content.light::-webkit-scrollbar-track {
          background: #f0f0f0; /* Lighter track for light mode */
          border: 2px solid #d0d0d0;
        }

        .pixel-content::-webkit-scrollbar-thumb {
          background: #ff69b4; /* Brighter pink thumb for dark mode */
          border: 2px solid #c71585;
          image-rendering: pixelated;
        }
        .pixel-content.light::-webkit-scrollbar-thumb {
          background: #9932cc; /* Darker purple thumb for light mode */
          border: 2px solid #6a0dad;
        }

        .pixel-content::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Custom Scrollbar Design for Projects Window */
        .projects-scrollbar::-webkit-scrollbar {
          width: 18px !important;
          height: 18px !important;
          image-rendering: pixelated;
          border-radius: 12px;
        }

        .projects-scrollbar.dark::-webkit-scrollbar-track {
          background: linear-gradient(90deg, #ffb6e6 0%, #ff69b4 100%);
          border: 3px solid #ff69b4;
          border-radius: 12px;
          image-rendering: pixelated;
        }
.projects-scrollbar.light::-webkit-scrollbar-track {
          background: linear-gradient(90deg, #ffe4f7 0%, #ffb6e6 100%);
          border: 3px solid #ff69b4;
          border-radius: 12px;
          image-rendering: pixelated;
        }

        .projects-scrollbar.dark::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
          border: 3px solid #ffb6e6;
          border-radius: 12px;
          image-rendering: pixelated;
          box-shadow: 2px 2px 0px rgba(255, 20, 147, 0.3);
        }
.projects-scrollbar.light::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #ffb6e6 0%, #ff69b4 100%);
          border: 3px solid #ffe4f7;
          border-radius: 12px;
          image-rendering: pixelated;
          box-shadow: 2px 2px 0px rgba(255, 182, 230, 0.3);
        }

        .projects-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #e75480 0%, #ff69b4 100%);
        }

        .projects-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Animations */
        @keyframes cloudFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes sunGlow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes pixelHeartFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes iconBob {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @media (max-width: 767px) {
          .pixel-window,
          .window,
          .mobile-window {
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: calc(100vh - 56px) !important;
            border-radius: 0 !important;
            min-width: 0 !important;
            min-height: 0 !important;
          }
          .pixel-content {
            padding-right: 4px !important;
            padding-left: 4px !important;
            height: calc(100vh - 112px) !important;
            font-size: 1.05rem !important;
          }
          .desktop-icon {
            position: static !important;
            margin: 8px 0 !important;
            padding: 8px 0 !important;
            flex-direction: row !important;
            align-items: center !important;
            width: 100vw !important;
            justify-content: flex-start !important;
            gap: 12px !important;
            border-radius: 0 !important;
          }
          .pixel-icon-frame {
            padding: 0 !important;
            margin-right: 12px !important;
            min-width: 48px !important;
            min-height: 48px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .pixel-icon {
            font-size: 2.5rem !important;
            margin-bottom: 0 !important;
          }
          .pixel-text {
            font-size: 1rem !important;
            padding: 6px 10px !important;
          }
          .pixel-taskbar {
            height: 56px !important;
            font-size: 1rem !important;
            padding: 0 4px !important;
          }
          .pixel-clock {
            padding: 4px 8px !important;
            font-size: 1rem !important;
          }
          .title-bar {
            padding: 12px 12px !important;
            font-size: 1.1rem !important;
            min-height: 48px !important;
          }
          .pixel-button {
            min-width: 40px !important;
            min-height: 40px !important;
            font-size: 1.1rem !important;
            padding: 0 !important;
          }
          .retro-text {
            font-size: 1.05rem !important;
            padding: 2px !important;
          }
          .projects-scrollbar::-webkit-scrollbar {
            width: 12px !important;
            height: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}
