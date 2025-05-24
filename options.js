document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("memoColor");

  chrome.storage.sync.get(["memoBgColor"], (result) => {
    input.value = result.memoBgColor || "#fff8b0";
  });

  input.addEventListener("change", () => {
    const color = input.value;
    chrome.storage.sync.set({ memoBgColor: color }, () => {
      console.log("✅ Couleur sauvegardée :", color);
    });
  });
});
