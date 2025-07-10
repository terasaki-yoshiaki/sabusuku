import { useState, useEffect } from 'react'
import { TermsOfService } from './components/TermsOfService'
import { InitialSetup } from './components/InitialSetup'
import { MainScreen } from './components/MainScreen'
import './App.css'

interface UserSettings {
  terms_accepted: boolean
  setup_completed: boolean
}

function App() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/user/settings`)
      const settings = await response.json()
      setUserSettings(settings)
    } catch (error) {
      console.error('Failed to fetch user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTermsAccepted = () => {
    setUserSettings(prev => prev ? { ...prev, terms_accepted: true } : null)
  }

  const handleSetupCompleted = () => {
    setUserSettings(prev => prev ? { ...prev, setup_completed: true } : null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!userSettings?.terms_accepted) {
    return <TermsOfService onAccept={handleTermsAccepted} />
  }

  if (!userSettings?.setup_completed) {
    return <InitialSetup onComplete={handleSetupCompleted} />
  }

  return <MainScreen />
}

export default App
