import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const ADMIN_DATA_DIR = path.join(process.cwd(), "public", "admin-data");
const MENU_FILE = path.join(ADMIN_DATA_DIR, "menu.json");
const SLIDES_FILE = path.join(ADMIN_DATA_DIR, "slides.json");

// Ensure admin data directory exists
function ensureDataDir() {
  if (!fs.existsSync(ADMIN_DATA_DIR)) {
    fs.mkdirSync(ADMIN_DATA_DIR, { recursive: true });
  }
}

// Initialize default data
function initializeDefaults() {
  ensureDataDir();

  // Initialize menu if it doesn't exist
  if (!fs.existsSync(MENU_FILE)) {
    const defaultMenu = {
      items: [
        { id: "1", label: "خانه", href: "/", order: 1 },
        { id: "2", label: "آموزش‌ها", href: "/tutorials", order: 2 },
        { id: "3", label: "درباره ما", href: "/about", order: 3 },
        { id: "4", label: "تماس با ما", href: "/contact", order: 4 },
      ],
    };
    fs.writeFileSync(MENU_FILE, JSON.stringify(defaultMenu, null, 2));
  }

  // Initialize slides if it doesn't exist
  if (!fs.existsSync(SLIDES_FILE)) {
    const defaultSlides = {
      slides: [
        {
          id: "1",
          title: "تولید تصاویر حرفه‌ای",
          subtitle: "با کیفیت بالا و سرعت فوری",
          bgColor: "from-blue-600 to-blue-400",
          imageUrl: "",
          order: 1,
        },
        {
          id: "2",
          title: "برای کسب‌وکار شما",
          subtitle: "افزایش فروش و اعتماد مشتری",
          bgColor: "from-purple-600 to-purple-400",
          imageUrl: "",
          order: 2,
        },
        {
          id: "3",
          title: "ساخت ایرانی، کیفیت جهانی",
          subtitle: "سرورهای قدرتمند و گرافیک‌های پیشرفته",
          bgColor: "from-indigo-600 to-indigo-400",
          imageUrl: "",
          order: 3,
        },
      ],
    };
    fs.writeFileSync(SLIDES_FILE, JSON.stringify(defaultSlides, null, 2));
  }
}

export function handleGetMenu(_req: Request, res: Response) {
  try {
    initializeDefaults();
    const data = fs.readFileSync(MENU_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading menu:", error);
    res.status(500).json({ error: "Error reading menu" });
  }
}

export function handleSaveMenu(req: Request, res: Response) {
  try {
    initializeDefaults();
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items data" });
    }

    const data = { items };
    fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: "Menu saved successfully" });
  } catch (error) {
    console.error("Error saving menu:", error);
    res.status(500).json({ error: "Error saving menu" });
  }
}

export function handleGetSlides(_req: Request, res: Response) {
  try {
    initializeDefaults();
    const data = fs.readFileSync(SLIDES_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading slides:", error);
    res.status(500).json({ error: "Error reading slides" });
  }
}

export function handleSaveSlides(req: Request, res: Response) {
  try {
    initializeDefaults();
    const { slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ error: "Invalid slides data" });
    }

    const data = { slides };
    fs.writeFileSync(SLIDES_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: "Slides saved successfully" });
  } catch (error) {
    console.error("Error saving slides:", error);
    res.status(500).json({ error: "Error saving slides" });
  }
}
