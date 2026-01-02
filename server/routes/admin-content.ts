import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const ADMIN_DATA_DIR = path.join(process.cwd(), "public", "admin-data");
const MENU_FILE = path.join(ADMIN_DATA_DIR, "menu.json");
const SLIDES_FILE = path.join(ADMIN_DATA_DIR, "slides.json");
const INDEX_SLIDES_FILE = path.join(ADMIN_DATA_DIR, "index-slides.json");
const ABOUT_SLIDES_FILE = path.join(ADMIN_DATA_DIR, "about-slides.json");

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

  // Initialize index slides if it doesn't exist
  if (!fs.existsSync(INDEX_SLIDES_FILE)) {
    const defaultIndexSlides = {
      slides: [
        {
          id: "1",
          title: "تولید تصاویر حرفه‌ای",
          subtitle: "با کیفیت بالا و سرعت فوری",
          bgColor: "from-blue-600 to-blue-400",
          imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fcb7ff6366612402c8b974195a58baf15?format=webp&width=800",
          order: 1,
        },
        {
          id: "2",
          title: "برای کسب‌وکار شما",
          subtitle: "افزایش فروش و اعتماد مشتری",
          bgColor: "from-purple-600 to-purple-400",
          imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fcb7ff6366612402c8b974195a58baf15?format=webp&width=800",
          order: 2,
        },
        {
          id: "3",
          title: "ساخت ایرانی، کیفیت جهانی",
          subtitle: "سرورهای قدرتمند و گرافیک‌های پیشرفته",
          bgColor: "from-indigo-600 to-indigo-400",
          imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fcb7ff6366612402c8b974195a58baf15?format=webp&width=800",
          order: 3,
        },
      ],
    };
    fs.writeFileSync(
      INDEX_SLIDES_FILE,
      JSON.stringify(defaultIndexSlides, null, 2),
    );
  }

  // Initialize about slides if it doesn't exist
  if (!fs.existsSync(ABOUT_SLIDES_FILE)) {
    const defaultAboutSlides = {
      slides: [
        {
          id: "1",
          title: "تولید تصاویر حرفه‌ای",
          subtitle: "با کیفیت بالا و سرعت فوری",
          bgColor: "from-blue-600 to-blue-400",
          imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fcb7ff6366612402c8b974195a58baf15?format=webp&width=800",
          order: 1,
        },
        {
          id: "2",
          title: "برای کسب‌وکار شما",
          subtitle: "افزایش فروش و اعتماد مشتری",
          bgColor: "from-purple-600 to-purple-400",
          imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fcb7ff6366612402c8b974195a58baf15?format=webp&width=800",
          order: 2,
        },
        {
          id: "3",
          title: "ساخت ایرانی، کیفیت جهانی",
          subtitle: "سرورهای قدرتمند و گرافیک‌های پیشرفته",
          bgColor: "from-indigo-600 to-indigo-400",
          imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fcb7ff6366612402c8b974195a58baf15?format=webp&width=800",
          order: 3,
        },
      ],
    };
    fs.writeFileSync(
      ABOUT_SLIDES_FILE,
      JSON.stringify(defaultAboutSlides, null, 2),
    );
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

// Index Slides Handlers
export function handleGetIndexSlides(_req: Request, res: Response) {
  try {
    initializeDefaults();
    const data = fs.readFileSync(INDEX_SLIDES_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading index slides:", error);
    res.status(500).json({ error: "Error reading index slides" });
  }
}

export function handleSaveIndexSlides(req: Request, res: Response) {
  try {
    initializeDefaults();
    const { slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ error: "Invalid slides data" });
    }

    const data = { slides };
    fs.writeFileSync(INDEX_SLIDES_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: "Index slides saved successfully" });
  } catch (error) {
    console.error("Error saving index slides:", error);
    res.status(500).json({ error: "Error saving index slides" });
  }
}

// About Slides Handlers
export function handleGetAboutSlides(_req: Request, res: Response) {
  try {
    initializeDefaults();
    const data = fs.readFileSync(ABOUT_SLIDES_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading about slides:", error);
    res.status(500).json({ error: "Error reading about slides" });
  }
}

export function handleSaveAboutSlides(req: Request, res: Response) {
  try {
    initializeDefaults();
    const { slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ error: "Invalid slides data" });
    }

    const data = { slides };
    fs.writeFileSync(ABOUT_SLIDES_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: "About slides saved successfully" });
  } catch (error) {
    console.error("Error saving about slides:", error);
    res.status(500).json({ error: "Error saving about slides" });
  }
}
