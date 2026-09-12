const tutorialStorageKey = "sidewalk-tutorial-completed-v1";

export function hasCompletedSidewalkTutorial(): boolean {
   try {
      return window.localStorage.getItem(tutorialStorageKey) === "1";
   } catch {
      return false;
   }
}

export function markSidewalkTutorialCompleted(): void {
   try {
      window.localStorage.setItem(tutorialStorageKey, "1");
   } catch {
      // The tutorial can still close normally when browser storage is unavailable.
   }
}
