export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("fi-FI", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${minutes} min`;
}