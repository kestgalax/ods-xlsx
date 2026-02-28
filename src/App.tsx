import './i18n'
import { ThemeProvider } from './theme'
import OdsConverter from './OdsConverter'

function App() {
  return (
    <ThemeProvider>
      <OdsConverter />
    </ThemeProvider>
  )
}

export default App
