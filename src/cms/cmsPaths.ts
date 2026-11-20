const MIGRATED_PATHS: string[] = ["/contact", "/about", "/services", "/integration", "/software", "/support", "/information-communication-technology", "/secure-defense", "/digital-transformation"];

const OVERRIDE = process.env.NODE_ENV !== "production" ? process.env.REACT_APP_CMS_PATHS_OVERRIDE : undefined;

const OVERRIDE_PATHS: string[] = OVERRIDE
  ? OVERRIDE.split(",")
      .map((path) => path.trim())
      .filter(Boolean)
  : [];

export const CMS_PATHS: string[] = [...MIGRATED_PATHS, ...OVERRIDE_PATHS];

if (process.env.NODE_ENV !== "production") {
  (window as unknown as { __cmsOverrideActive: boolean }).__cmsOverrideActive = OVERRIDE_PATHS.length > 0;
}
