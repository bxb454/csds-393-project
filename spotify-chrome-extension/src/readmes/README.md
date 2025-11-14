 ## Sample on how you can call the LLM Client in a react component.
 
 ```javascript
 //simple setup guide
 const [theme, setTheme] = useState<any>(null)

async function handleGenerateTheme() {
  try {
    LLMTheming.setApiKey("YOUR_API_KEY")
    const generatedTheme = await LLMTheming.generateRandomTheme()
    setTheme(generatedTheme)
  } catch (error) {
    alert("Error: " + (error as Error).message)
  }
}

//Usage with TSX:
<button onClick={handleGenerateTheme}>Generate Theme</button>
{theme && <p>Primary Color: {theme.colors.primary.r}, {theme.colors.primary.g}, {theme.colors.primary.b}</p>}
  ```