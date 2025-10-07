import DOMPurify from "dompurify";

export function isNullOrEmpty(key: any): boolean {
  return key == null || key === "";
}

export function isUndefined(key: any): boolean {
  return key == undefined;
}

export function convertMinutesToMilliSeconds(minutes: number): number {
  return Math.floor(minutes * 60 * 1000);
}

export function convertSecondsToMilliSeconds(seconds: number): number {
  return Math.floor(seconds * 1000);
}

export function convertMinutesToSeconds(minutes: number): number {
  return Math.floor(minutes * 60);
}

export const formatTime = (seconds: any) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export function purifyData(input: any): any {
  if (typeof input === "string") {
    return DOMPurify.sanitize(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) =>
      typeof item === "string" ? DOMPurify.sanitize(item) : item,
    );
  }

  if (typeof input === "object" && input !== null) {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const value = input[key];
        if (typeof value === "string") {
          sanitizedObject[key] = DOMPurify.sanitize(value);
        } else if (Array.isArray(value)) {
          sanitizedObject[key] = value.map((item) =>
            typeof item === "string" ? DOMPurify.sanitize(item) : item,
          );
        } else if (typeof value === "object" && value !== null) {
          sanitizedObject[key] = purifyData(value);
        } else {
          sanitizedObject[key] = value;
        }
      }
    }
    return sanitizedObject;
  }

  return input;
}

export function getPaymentMethodDesc(dataStr: string): string {
  const desc = dataStr.split("|")[1];
  return desc;
}

export function getQRCountdownTime(dataStr: string): number {
  const minutes = dataStr.split("|")[2];
  const ms = convertMinutesToSeconds(parseInt(minutes));
  return ms;
}

export function getPointMultiplier(dataStr: string): number {
  var n = dataStr.split("|")[3];
  if (!isNullOrEmpty(n)) {
    return Number(dataStr.split("|")[3]);
  }

  return 0;
}
