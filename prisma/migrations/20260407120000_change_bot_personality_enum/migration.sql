-- Drop the default so we can alter the enum
ALTER TABLE "User" ALTER COLUMN "botPersonality" DROP DEFAULT;

-- Rename old enum out of the way
ALTER TYPE "BotPersonality" RENAME TO "BotPersonality_old";

-- Create the new enum
CREATE TYPE "BotPersonality" AS ENUM ('usual', 'business', 'bad_guy');

-- Migrate existing data: all old values become 'usual'
ALTER TABLE "User"
  ALTER COLUMN "botPersonality" TYPE "BotPersonality"
  USING (
    CASE "botPersonality"::text
      WHEN 'neutral'    THEN 'usual'
      WHEN 'encouraging' THEN 'usual'
      WHEN 'strict'     THEN 'usual'
      ELSE 'usual'
    END
  )::"BotPersonality";

-- Set the new default
ALTER TABLE "User" ALTER COLUMN "botPersonality" SET DEFAULT 'usual'::"BotPersonality";

-- Drop the old enum
DROP TYPE "BotPersonality_old";
