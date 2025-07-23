"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneOff, Video, Clock, User } from "lucide-react"
import type { CallState } from "@/hooks/use-video-call"

interface CallNotificationProps {
  callState: CallState
  onAnswer: () => void
  onReject: () => void
}

export default function CallNotification({ callState, onAnswer, onReject }: CallNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [ringDuration, setRingDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Show/hide notification based on call state
  useEffect(() => {
    if (callState.status === "ringing" && callState.isIncoming) {
      setIsVisible(true)
      setRingDuration(0)

      // Start ring duration counter
      intervalRef.current = setInterval(() => {
        setRingDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setIsVisible(false)
      setRingDuration(0)

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [callState.status, callState.isIncoming])

  // Handle ringing sound
  useEffect(() => {
    if (callState.status === "ringing" && callState.isIncoming) {
      playRingingSound()
    } else {
      stopRingingSound()
    }

    return () => {
      stopRingingSound()
    }
  }, [callState.status, callState.isIncoming])

  const playRingingSound = () => {
    try {
      // Create audio element with ringing sound
      if (!audioRef.current) {
        const audio = new Audio()
        // Using a data URL for a simple ringing tone
        audio.src =
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQo9PnvH0xBAscPIa74OWqUxEBChIwdqvN89WdRRUABAkaWYypx+nfoFs3DwIFCCFMeZGl0PbyuXZEHwIBBRE2X3yYuOr//tKWTjEKAAEHHUBkiaS83v//4KpiQBwFAAMSL0lriZ7O8///8MF+WzYQAAAFGzZRcJKq2P7//9iueFkqBgAACSZCXn+fxu///+/NkGtFGQEABBtEaIqpz/b//+jDi2c7EAAABiA8V3OUr9r8///kxI1pPBQCAAYaOlVui6LH9v//7cuVckIcBQADFTFJZoKbvOX6///zyJd3SiMIAAIQKkBYdo2nzvH+///uxpR5UigGAAMPJjpUbYeew+j7///0zZ+ATCgGAAQQJjhRbIWdweX8///30KKETioHAAUQJDVOaYObvuL7///61aWIUSwIAAYQIzJLZYCYuuD6///+2KiKVS8KAAcQIjBIYn2Vttz5////26uMWDELAAgRIi9GYHqTs9v4////3q2PWjMMAAkRIS1DXniRsdj4////4a+RXDQNAAoSIS1CXXeQr9f3////47GSXjUOAAsSIi1CXXaPrtb3////5bOTYDYPAAwTIi1BXHWOrdX2////57WVYjcQAA0TIi1BWnSMq9T1////6beWZDkRAA4UIi1BWXKLqtP1////67iYZTsRAA8VIy1AWHGKqdL0////7bqZZz0SABAVIy0/V3CJp9Hz////77ybaj4TARIWIy09VW6IptDy////8b6cbEAUAhMXJC08VG2HpdDx////88CebUIVAxQYJC07U2yGpM/w////9cGgb0QWBBUZJSw6UmuEos7v////98OhcUYXBRcaJSw5UWqDoM3u////+sWjc0cYBhgbJSw4UGmCn8zt/////MekdUkZBxkdJSw3T2iBnsrs/////8mmdk0aCBoeJSw2TmZ/nMnr/////8uneFAcCRwgJSw1TWV+m8jq/////82peVIdChwhJSw0TGR9msfp/////8+re1QfCx4iJSszS2N8mcbo/////9GsfVYgDB8jJSwySWJ7mMXn/////9OtflghDSElJiwxSGF6l8Tm/////9WvgFojDiImJiwwR2B5lsPl/////9exgVwkDyMnJisvRl94lcLk/////9mzg14lECQoJistRV53lMHj/////9u0hGAmESUpJistRFx2k7/i/////9y2hmInEiYrJyosQ1t1kr7h/////963h2MoEycsJyorQlp0kbzg/////+C5iWQpFCgtJykqQVlzkLvf/////+K6imYqFSkuJykpQFhykLrd/////+O8i2csFiluJygpP1dxj7nc/////+W9jWgtFypvJygoPldwjrjb/////+a/jmkvGCtwJycoPVZvjbfa/////+jAkGowGSxxJycnPFVujLXZ/////+rBkWsyGi1yJyYmO1RtjLTY/////+vDk20zGy5zJyYlOlNsi7PX/////+3ElG40HC90JyYlOVJri7HW/////+7Flm81HS91JyUkOFFqi7DV/////+/Hl3A2Hi92JyUkN1Bpi6/U/////+/ImHE3Hy93JyQjNk9oi67T/////+/JmXI4IC94JyQjNU5ni63S/////+/KmnM5IS95JyQiNE1mi6zR/////+/Lm3Q6Ii96JyMiM0xli6vQ/////+/MnHU7Iy97JyMhMktki6rP/////+/NnXY8JC98JyMhMUpji6nO/////+/OnnY9JS99JyIgMElii6jN/////+/Pn3c+JjB+JyIgL0hhi6fM/////+/QoHhAJzF/JyEfLkdgi6bL/////+/RoXlBKDKAJyEfLUZfi6XK/////+/SonpCKTOBJyEeLEVei6TJ/////+/To3tDKjSCJyAeK0RdiaPH/////+/UpHxEKzWDJyAdKkNci6LG/////+/VpX1FLDaEJyAdKUJbi6HF/////+/Wpn5GLTeEJyAcKEFai6DD/////+/Xp39HLjiEJx8cJ0Bai5/C/////+/YqIBILzmEJx8bJj9ZipC7+f////TaqoJKMDqEJx8bJT5YipC5+P////PcqoNLMTuEJx8aJD1XipC4+P////LdrIVMMjyEJx4aIzxXipC39/////HerYZOMz2EJx4ZIjtWipC29v////DfrodPND6EJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZITpViZC19v////DgroVKLzqDJx4ZI"
        audio.loop = true
        audioRef.current = audio
      }
      audioRef.current.play().catch(console.error)
    } catch (error) {
      console.error("Failed to play ringing sound:", error)
    }
  }

  const stopRingingSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = () => {
    stopRingingSound()
    onAnswer()
  }

  const handleReject = () => {
    stopRingingSound()
    onReject()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 animate-in zoom-in-95 duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Caller Info */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-blue-500 ring-offset-2 animate-pulse">
                  <AvatarImage
                    src={callState.remoteParticipant?.avatar || "/placeholder.svg"}
                    alt={callState.remoteParticipant?.name || "Caller"}
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-xl">
                    {callState.remoteParticipant?.name?.[0] || <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                  <Video className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold">{callState.remoteParticipant?.name || "Unknown Caller"}</h3>
                <p className="text-sm text-muted-foreground">
                  {callState.remoteParticipant?.role === "doctor" ? "Doctor" : "Patient"}
                </p>
                {callState.appointmentId && <p className="text-xs text-muted-foreground mt-1">Appointment Call</p>}
              </div>
            </div>

            {/* Call Status */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Ringing... {formatTime(ringDuration)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button variant="destructive" size="lg" className="rounded-full h-14 w-14" onClick={handleReject}>
                <PhoneOff className="h-6 w-6" />
              </Button>

              <Button
                variant="default"
                size="lg"
                className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
                onClick={handleAnswer}
              >
                <Video className="h-6 w-6" />
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>Video call will start automatically after accepting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
