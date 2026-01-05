import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Microphone, Stop, Play, Pause, Trash, Circle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Recording {
  id: string
  url: string
  blob: Blob
  duration: number
  timestamp: number
}

type RecordingState = 'idle' | 'requesting' | 'recording' | 'stopped'

function App() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordings, setRecordings] = useKV<Recording[]>('audio-recordings', [])
  const [currentTime, setCurrentTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  
  const recordingsList = recordings || []
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())

  const isSupported = typeof MediaRecorder !== 'undefined'

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      audioRefs.current.forEach(audio => {
        audio.pause()
        URL.revokeObjectURL(audio.src)
      })
    }
  }, [])

  const startRecording = async () => {
    if (!isSupported) {
      setError('Jūsų naršyklė nepalaiko garso įrašymo. Prašome atnaujinti naršyklę.')
      return
    }

    setError('')
    setRecordingState('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const duration = currentTime

        if (duration < 1) {
          toast.error('Įrašas per trumpas. Bandykite dar kartą.')
          setRecordingState('idle')
          setCurrentTime(0)
          return
        }

        const newRecording: Recording = {
          id: Date.now().toString(),
          url: audioUrl,
          blob: audioBlob,
          duration: duration,
          timestamp: Date.now()
        }

        setRecordings(current => [...(current || []), newRecording])
        toast.success('Pasakojimas sėkmingai įrašytas!')
        setRecordingState('idle')
        setCurrentTime(0)

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecordingState('recording')
      setCurrentTime(0)

      timerRef.current = window.setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Nepavyko pasiekti mikrofono. Prašome leisti prieigą prie mikrofono.')
      setRecordingState('idle')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const togglePlayback = (recording: Recording) => {
    const audio = audioRefs.current.get(recording.id) || new Audio(recording.url)
    
    if (!audioRefs.current.has(recording.id)) {
      audioRefs.current.set(recording.id, audio)
      audio.onended = () => setPlayingId(null)
    }

    if (playingId === recording.id) {
      audio.pause()
      setPlayingId(null)
    } else {
      audioRefs.current.forEach((a, id) => {
        if (id !== recording.id) {
          a.pause()
        }
      })
      audio.play()
      setPlayingId(recording.id)
    }
  }

  const deleteRecording = (id: string) => {
    const audio = audioRefs.current.get(id)
    if (audio) {
      audio.pause()
      URL.revokeObjectURL(audio.src)
      audioRefs.current.delete(id)
    }
    
    setRecordings(current => (current || []).filter(r => r.id !== id))
    
    if (playingId === id) {
      setPlayingId(null)
    }
    
    toast.success('Įrašas ištrintas')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('lt-LT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Pasakojimų įrašymas
          </h1>
          <p className="text-muted-foreground text-lg font-serif">
            Įrašykite savo pasakojimus paprastai ir greitai
          </p>
        </motion.div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {recordingState === 'idle' ? (
              <motion.div
                key="idle"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full"
              >
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-full h-32 text-2xl font-bold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                >
                  <Microphone size={48} weight="fill" className="mr-4" />
                  Pradėti pasakojimą
                </Button>
              </motion.div>
            ) : recordingState === 'requesting' ? (
              <motion.div
                key="requesting"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full"
              >
                <Button
                  disabled
                  size="lg"
                  className="w-full h-32 text-2xl font-bold"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Microphone size={48} weight="fill" className="mr-4" />
                  </motion.div>
                  Laukiama leidimo...
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="recording"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full space-y-4"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(239, 68, 68, 0.4)',
                      '0 0 0 20px rgba(239, 68, 68, 0)',
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative"
                >
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    className="w-full h-32 text-2xl font-bold bg-accent hover:bg-accent/90"
                  >
                    <Stop size={48} weight="fill" className="mr-4" />
                    Sustabdyti įrašymą
                  </Button>
                </motion.div>
                
                <Card className="p-6 text-center bg-card/80 backdrop-blur">
                  <div className="flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Circle size={16} weight="fill" className="text-accent" />
                    </motion.div>
                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                      {formatTime(currentTime)}
                    </span>
                    <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                      ĮRAŠOMA
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {recordingsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-foreground">
              Jūsų įrašai ({recordingsList.length})
            </h2>
            
            <div className="space-y-3">
              <AnimatePresence>
                {recordingsList.map((recording, index) => (
                  <motion.div
                    key={recording.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-4 transition-all duration-200 hover:shadow-lg ${
                      playingId === recording.id ? 'ring-2 ring-accent' : ''
                    }`}>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => togglePlayback(recording)}
                          className="h-12 w-12 rounded-full shrink-0"
                        >
                          {playingId === recording.id ? (
                            <Pause size={24} weight="fill" />
                          ) : (
                            <Play size={24} weight="fill" />
                          )}
                        </Button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              Pasakojimas #{recordingsList.length - index}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {formatTime(recording.duration)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-serif">
                            {formatDate(recording.timestamp)}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRecording(recording.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash size={20} />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {recordingsList.length === 0 && recordingState === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg font-serif">
              Dar neturite įrašytų pasakojimų. Spauskite mygtuką ir pradėkite!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
