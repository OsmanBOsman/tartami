// codemods/replace-createServerClient.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TARGET_EXTENSIONS = [".ts", ".tsx"];

// Directories we must NEVER touch
const IGNORE_DIRS = ["node_modules", ".next", "dist"];

function walk(dir, files = []) {
  // Skip ignored directories
  if (IGNORE_DIRS.some((skip) => dir.includes(skip))) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip ignored directories
      if (IGNORE_DIRS.some((skip) => full.includes(skip))) continue;
      walk(full, files);
    } else if (TARGET_EXTENSIONS.some((ext) => full.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function transformFile(filePath) {
  let code = fs.readFileSync(filePath, "utf8");

  if (!code.includes("createServerClient")) return;

  let changed = false;

  // Remove direct import of createServerClient
  code = code.replace(
    /import\s*\{\s*createServerClient\s*\}\s*from\s*"@supabase\/ssr";?\s*/g,
    () => {
      changed = true;
      return "";
    }
  );

  // Ensure import of createClient
  if (!code.includes(`from "@/lib/supabase/server"`)) {
    code = `import { createClient } from "@/lib/supabase/server";\n` + code;
    changed = true;
  } else if (!code.includes("createClient")) {
    code = code.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s+"@\/lib\/supabase\/server";/,
      (m, names) => {
        const parts = String(names).split(",").map((s) => s.trim());
        if (!parts.includes("createClient")) parts.push("createClient");
        changed = true;
        return `import { ${parts.join(", ")} } from "@/lib/supabase/server";`;
      }
    );
  }

  // Replace createServerClient(...) with createSupabaseServerClient()
  code = code.replace(
    /const\s+supabase\s*=\s*createServerClient\([\s\S]*?\);/,
    () => {
      changed = true;
      return `const supabase = createSupabaseServerClient();`;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, code, "utf8");
    console.log("Updated:", path.relative(ROOT, filePath));
  }
}

function main() {
  // SAFETY FILTER — DO NOT REMOVE
  const files = walk(ROOT).filter(f => !f.includes("node_modules"));
  for (const file of files) transformFile(file);
}

main();
