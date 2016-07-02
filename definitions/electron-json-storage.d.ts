declare module "electron-json-storage" {
	export function get(key: string, callback: (error: any, data: any) => void): void;
}
