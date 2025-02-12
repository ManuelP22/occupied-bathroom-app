export function getUserId(): string {
  // Verifica si ya existe en localStorage
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // Genera un nuevo UUID (los navegadores modernos soportan crypto.randomUUID)
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
}