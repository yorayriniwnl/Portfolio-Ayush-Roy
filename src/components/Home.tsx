import { HomeAbout } from "./experience/HomeAbout";
import { HomeContact } from "./experience/HomeContact";
import { MachineHero } from "./experience/MachineHero";
import { HomeProjectWorlds } from "./experience/HomeProjectWorlds";
import { MachineScrollBinding } from "./experience/MachineScrollBinding";

export function Home() {
  return (
    <main id="main" className="machine-home">
      <MachineScrollBinding>
        <MachineHero />
        <HomeProjectWorlds />
        <HomeAbout />
        <HomeContact />
      </MachineScrollBinding>
    </main>
  );
}
