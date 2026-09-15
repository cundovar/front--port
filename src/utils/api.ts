const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const productionBaseUrl = "https://backport.varascundo.com";
const baseUrl = import.meta.env.DEV
  ? ""
  : configuredBaseUrl && !/localhost|127\.0\.0\.1/i.test(configuredBaseUrl)
    ? configuredBaseUrl
    : productionBaseUrl;
const isEnabled = import.meta.env.DEV || baseUrl.length > 0;

const withBaseUrl = (path: string): string => {
  if (!baseUrl || !path.startsWith("/")) {
    return path;
  }

  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

export const api = {
  isEnabled,
  assetUrl: (input?: string | null): string => {
    if (!input) return "";
    if (/^(data:|blob:|https?:\/\/)/i.test(input)) return input;

    return withBaseUrl(input);
  },
  fetch: (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" && input.startsWith("/") ? withBaseUrl(input) : input;
    return fetch(url, init);
  },
};
