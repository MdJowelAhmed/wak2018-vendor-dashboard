import { AppRouter } from "@/routes";
import { AppProvider } from "@/app/provider";

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
