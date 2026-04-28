from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from textwrap import wrap


PAGE_W = 595
PAGE_H = 842
MARGIN = 42
TOP_BAND = 96
CONTENT_TOP = 752
CONTENT_BOTTOM = 70

BG = (0.985, 0.981, 0.974)
SOFT = (0.952, 0.931, 0.902)
PANEL = (1.0, 1.0, 1.0)
DARK = (0.16, 0.13, 0.11)
BODY = (0.22, 0.18, 0.16)
MUTED = (0.50, 0.43, 0.38)
ACCENT = (0.69, 0.51, 0.28)
ACCENT_DARK = (0.46, 0.32, 0.16)
LINE = (0.88, 0.84, 0.79)
WHITE = (1.0, 1.0, 1.0)

OUTPUT_PATH = Path(r"C:\Users\User\Documents\New project\server\digital-downloads\guides\the-atelier-living-room-guide.pdf")


@dataclass
class Palette:
    title: str
    subtitle: str
    colors: list[tuple[str, tuple[float, float, float]]]
    use_cases: list[str]
    notes: list[str]


PALETTES = [
    Palette(
        title="Soft Neutral",
        subtitle="For bright rooms that need quiet warmth and a softer silhouette.",
        colors=[
            ("Oat", (0.95, 0.92, 0.87)),
            ("Flax", (0.88, 0.83, 0.76)),
            ("Stone", (0.77, 0.72, 0.66)),
            ("Clay", (0.70, 0.60, 0.52)),
            ("Ink Brown", (0.25, 0.22, 0.19)),
        ],
        use_cases=[
            "Walls in oat or warm off-white.",
            "Curtains and linen in flax or stone.",
            "Accent objects in clay, smoked glass, or deep brown.",
        ],
        notes=[
            "Keep contrast gentle so the room still feels light in the evening.",
            "Boucle, washed linen, matte ceramic, and pale oak all work especially well here.",
        ],
    ),
    Palette(
        title="Warm Contrast",
        subtitle="For rooms that need more depth without becoming visually heavy.",
        colors=[
            ("Milk", (0.97, 0.95, 0.92)),
            ("Putty", (0.84, 0.78, 0.71)),
            ("Olive Smoke", (0.54, 0.56, 0.49)),
            ("Burnt Walnut", (0.39, 0.29, 0.23)),
            ("Soft Brass", (0.72, 0.60, 0.37)),
        ],
        use_cases=[
            "Ground the room with one deeper tone on the sofa, rug, or timber.",
            "Use olive smoke or putty in scatter cushions and smaller fabric accents.",
            "Reserve brass for one or two details only.",
        ],
        notes=[
            "This palette works especially well in rooms with afternoon light.",
            "Balance deeper tones with at least one generous pale surface.",
        ],
    ),
    Palette(
        title="Deeper Calm",
        subtitle="For a boutique-feel evening mood with more editorial weight.",
        colors=[
            ("Bone", (0.95, 0.93, 0.90)),
            ("Taupe", (0.73, 0.66, 0.59)),
            ("Moss Grey", (0.49, 0.51, 0.46)),
            ("Espresso", (0.22, 0.18, 0.16)),
            ("Aged Copper", (0.60, 0.42, 0.30)),
        ],
        use_cases=[
            "Use bone as the balancing light tone.",
            "Let espresso appear in a single anchor piece or a framed accent.",
            "Pair moss grey with washed textiles rather than sleek synthetics.",
        ],
        notes=[
            "The room should still breathe. Depth works best when negative space stays visible.",
            "This direction is ideal if you want a slower, more cocooning atmosphere.",
        ],
    ),
]


PAGES = [
    {"kind": "cover"},
    {"kind": "contents"},
    {"kind": "note"},
    {"kind": "divider", "number": "01", "title": "Foundations", "subtitle": "Start with atmosphere, not shopping."},
    {"kind": "signals"},
    {"kind": "mistakes"},
    {"kind": "divider", "number": "02", "title": "Palette Direction", "subtitle": "Build warmth through color restraint and material contrast."},
    {"kind": "palette", "palette": PALETTES[0]},
    {"kind": "palette", "palette": PALETTES[1]},
    {"kind": "palette", "palette": PALETTES[2]},
    {"kind": "divider", "number": "03", "title": "Layout and Layers", "subtitle": "Structure the room before you style it."},
    {"kind": "layout"},
    {"kind": "layers"},
    {"kind": "styling"},
    {"kind": "divider", "number": "04", "title": "Reset and Refine", "subtitle": "Edit the room until it can breathe."},
    {"kind": "reset"},
    {"kind": "audit"},
    {"kind": "checklist"},
    {"kind": "closing"},
]


def escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def rgb_fill(color: tuple[float, float, float]) -> str:
    return f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f} rg"


def rgb_stroke(color: tuple[float, float, float]) -> str:
    return f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f} RG"


def wrap_for_width(text: str, font_size: int, width: int) -> list[str]:
    max_chars = max(16, int(width / (font_size * 0.52)))
    lines: list[str] = []
    for raw_line in text.split("\n"):
        if not raw_line.strip():
            lines.append("")
            continue
        lines.extend(wrap(raw_line, width=max_chars))
    return lines


class PageCanvas:
    def __init__(self, page_number: int, page_count: int) -> None:
        self.page_number = page_number
        self.page_count = page_count
        self.ops: list[str] = []
        self.y = CONTENT_TOP
        self._draw_background()
        self._draw_footer()

    def _draw_background(self) -> None:
        self.rect_fill(0, 0, PAGE_W, PAGE_H, BG)
        self.rect_fill(0, PAGE_H - TOP_BAND, PAGE_W, TOP_BAND, SOFT)

    def _draw_footer(self) -> None:
        self.rect_fill(MARGIN, 44, PAGE_W - (MARGIN * 2), 1, LINE)
        self.text(
            MARGIN,
            24,
            f"The Atelier Living Room Guide - Page {self.page_number} of {self.page_count}",
            9,
            "F1",
            MUTED,
        )

    def rect_fill(self, x: float, y: float, w: float, h: float, color: tuple[float, float, float]) -> None:
        self.ops.extend(["q", rgb_fill(color), f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re f", "Q"])

    def rect_stroke(self, x: float, y: float, w: float, h: float, color: tuple[float, float, float], line_width: float = 1) -> None:
        self.ops.extend(["q", rgb_stroke(color), f"{line_width:.2f} w", f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re S", "Q"])

    def line(self, x1: float, y1: float, x2: float, y2: float, color: tuple[float, float, float], line_width: float = 1) -> None:
        self.ops.extend(["q", rgb_stroke(color), f"{line_width:.2f} w", f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S", "Q"])

    def text(self, x: float, y: float, text: str, size: int, font: str = "F1", color: tuple[float, float, float] = BODY) -> None:
        self.ops.extend(
            [
                "BT",
                f"/{font} {size} Tf",
                rgb_fill(color),
                f"1 0 0 1 {x:.2f} {y:.2f} Tm",
                f"({escape_pdf_text(text)}) Tj",
                "ET",
            ]
        )

    def center_text(self, center_x: float, y: float, text: str, size: int, font: str = "F1", color: tuple[float, float, float] = BODY) -> None:
        width_estimate = len(text) * size * 0.29
        self.text(center_x - width_estimate, y, text, size, font, color)

    def text_block(
        self,
        x: float,
        y: float,
        text: str,
        size: int,
        width: int,
        leading: int = 18,
        font: str = "F1",
        color: tuple[float, float, float] = BODY,
    ) -> float:
        cursor = y
        for line in wrap_for_width(text, size, width):
            self.text(x, cursor, line, size, font, color)
            cursor -= leading
        return cursor

    def bullet_list(self, x: float, y: float, items: list[str], width: int = 440, size: int = 11) -> float:
        cursor = y
        for item in items:
            self.rect_fill(x, cursor - 3, 7, 7, ACCENT)
            wrapped = wrap_for_width(item, size, width)
            self.text(x + 18, cursor - 1, wrapped[0], size, "F1", BODY)
            cursor -= 17
            for line in wrapped[1:]:
                self.text(x + 18, cursor - 1, line, size, "F1", BODY)
                cursor -= 15
            cursor -= 8
        return cursor

    def label(self, x: float, y: float, text: str) -> None:
        self.text(x, y, text.upper(), 10, "F2", ACCENT)

    def title_block(self, eyebrow: str, title: str, subtitle: str | None = None) -> None:
        self.label(MARGIN, PAGE_H - 58, eyebrow)
        title_y = PAGE_H - 128
        for index, line in enumerate(title.split("\n")):
            self.text(MARGIN, title_y, line, 28 if index == 0 else 26, "F2", BODY)
            title_y -= 34
        self.y = title_y - 4
        if subtitle:
            self.y = self.text_block(MARGIN, self.y, subtitle, 13, 470, leading=19, font="F1", color=MUTED) - 6

    def card(self, x: float, y: float, w: float, h: float, title: str, body: str, eyebrow: str | None = None) -> None:
        self.rect_fill(x, y, w, h, PANEL)
        self.rect_stroke(x, y, w, h, LINE, 0.8)
        if eyebrow:
            self.text(x + 16, y + h - 24, eyebrow.upper(), 9, "F2", MUTED)
            title_y = y + h - 50
        else:
            title_y = y + h - 34
        self.text(x + 16, title_y, title, 16, "F2", BODY)
        self.text_block(x + 16, title_y - 24, body, 10, int(w - 32), leading=14, font="F1", color=MUTED)

    def divider_page(self, number: str, title: str, subtitle: str) -> None:
        self.rect_fill(34, 118, PAGE_W - 68, 590, DARK)
        self.rect_fill(34, 118, 16, 590, ACCENT)
        self.text(70, 624, number, 86, "F2", WHITE)
        self.text(72, 546, title, 34, "F2", WHITE)
        self.text_block(72, 506, subtitle, 14, 360, leading=20, font="F3", color=(0.88, 0.84, 0.80))
        self.text(72, 402, "This section covers", 11, "F2", (0.84, 0.79, 0.74))
        divider_notes = {
            "01": ["expensive-feel signals", "the fastest mistakes to remove", "the mood before the product list"],
            "02": ["three cohesive palette directions", "where deeper tones should appear", "how to keep warmth without visual noise"],
            "03": ["rug, sofa, and coffee table proportion", "lighting layers and textile balance", "surface styling that still feels calm"],
            "04": ["a seven-day reset plan", "a room audit worksheet", "a final shopping and editing checklist"],
        }[number]
        cursor = 372
        for note in divider_notes:
            self.rect_fill(72, cursor - 3, 7, 7, ACCENT)
            self.text(90, cursor - 1, note, 12, "F1", WHITE)
            cursor -= 30

    def render_cover(self) -> None:
        self.rect_fill(34, 106, 527, 622, PANEL)
        self.rect_fill(34, 106, 262, 622, DARK)
        self.rect_fill(296, 552, 265, 176, SOFT)
        self.text(62, 672, "DIGITAL ATELIER GUIDE", 11, "F2", (0.82, 0.74, 0.66))
        self.text(62, 608, "The Atelier", 34, "F2", WHITE)
        self.text(62, 566, "Living Room Guide", 34, "F2", WHITE)
        self.text_block(
            62,
            504,
            "A practical and visual PDF for building a calmer, warmer, and more elevated living room without turning it into a showroom.",
            13,
            194,
            leading=19,
            font="F1",
            color=(0.90, 0.86, 0.82),
        )
        self.text(62, 346, "Format", 10, "F2", (0.76, 0.69, 0.61))
        self.text(62, 322, "Printable PDF", 18, "F2", WHITE)
        self.text(62, 270, "Focus", 10, "F2", (0.76, 0.69, 0.61))
        self.text(62, 246, "Layout, palette, texture", 18, "F2", WHITE)
        self.text(62, 194, "Tone", 10, "F2", (0.76, 0.69, 0.61))
        self.text(62, 170, "Quiet, premium, practical", 18, "F2", WHITE)

        self.text(324, 682, "Inside this guide", 12, "F2", BODY)
        self.card(320, 564, 102, 112, "Palette", "Three restrained directions for bright, warm, and deeper rooms.")
        self.card(434, 564, 102, 112, "Layout", "Rules for rug size, spacing, and conversational flow.")
        self.card(320, 436, 102, 112, "Layers", "Lighting, textiles, and materials that add calm depth.")
        self.card(434, 436, 102, 112, "Reset", "A seven-day refresh plan, audit sheet, and final checklist.")
        self.rect_fill(320, 180, 216, 214, WHITE)
        self.rect_stroke(320, 180, 216, 214, LINE, 0.8)
        self.text(340, 358, "What expensive feel actually means", 12, "F2", BODY)
        quote = (
            "A premium room rarely feels premium because everything in it is expensive. "
            "It feels premium because the proportions are clear, the palette is controlled, and every object has room to breathe."
        )
        self.text_block(340, 324, quote, 12, 176, leading=18, font="F3", color=MUTED)

    def render_contents(self) -> None:
        self.title_block("Contents", "What is inside the guide", "A premium room is usually built in this order: mood, palette, structure, layering, and only then detail.")
        cards = [
            ("01 Foundations", "Pages 4-6", "Atmosphere, expensive-feel signals, and the fastest mistakes to remove."),
            ("02 Palette Direction", "Pages 7-10", "Three restrained palette systems with notes on application and contrast."),
            ("03 Layout and Layers", "Pages 11-14", "Room structure, spacing, lighting, materials, and the shelf styling formula."),
            ("04 Reset and Refine", "Pages 15-19", "A one-week room reset, an audit worksheet, and a final shopping checklist."),
        ]
        y = 516
        for title, page_range, text in cards:
            self.rect_fill(MARGIN, y, 510, 94, PANEL)
            self.rect_stroke(MARGIN, y, 510, 94, LINE, 0.8)
            self.text(MARGIN + 18, y + 60, title, 16, "F2", BODY)
            self.text(MARGIN + 18, y + 36, page_range, 10, "F2", ACCENT)
            self.text_block(MARGIN + 170, y + 56, text, 10, 310, leading=14, font="F1", color=MUTED)
            y -= 112

    def render_note(self) -> None:
        self.title_block("Note from the atelier", "A quieter room is usually a better room")
        intro = (
            "This guide is not a long list of things to buy. It is a framework for deciding what to keep, where to add softness, and how to stop a room from feeling overfilled."
        )
        self.y = self.text_block(MARGIN, self.y, intro, 13, 500, leading=19, font="F1", color=MUTED) - 10
        self.card(42, 430, 155, 166, "Restraint", "Use fewer objects and let each one read clearly. The eye needs pauses.", "Principle")
        self.card(220, 430, 155, 166, "Texture", "Layer linen, wool, boucle, wood, and stone so the room feels rich without feeling loud.", "Principle")
        self.card(398, 430, 155, 166, "Atmosphere", "Light, scent, and proportion shape how a room feels long before styling details do.", "Principle")
        self.rect_fill(42, 208, 511, 176, SOFT)
        self.text(62, 336, "Use this guide when", 11, "F2", BODY)
        self.bullet_list(
            62,
            306,
            [
                "Refreshing your current living room without replacing everything.",
                "Planning a new sofa, rug, or lighting purchase with more confidence.",
                "Trying to make the room feel premium without making it feel formal.",
            ],
            width=450,
        )

    def render_signals(self) -> None:
        self.title_block("Foundations", "What actually creates premium feel")
        intro = "The strongest shift rarely comes from adding more. It comes from aligning four quiet signals."
        self.y = self.text_block(MARGIN, self.y, intro, 13, 500, leading=18, font="F1", color=MUTED) - 6
        self.card(42, 482, 246, 126, "Proportion", "A correctly sized rug, coffee table, and curtain drop make the room feel composed before any styling begins.")
        self.card(307, 482, 246, 126, "Light", "A room with one overhead bulb looks unfinished. A room with layered lamp light looks cared for.")
        self.card(42, 330, 246, 126, "Texture", "Natural variation in fabric and material creates depth without demanding more color.")
        self.card(307, 330, 246, 126, "Negative space", "Clear space around objects lets the eye rest and makes every piece feel more intentional.")
        self.rect_fill(42, 154, 511, 126, PANEL)
        self.rect_stroke(42, 154, 511, 126, LINE, 0.8)
        self.text(62, 240, "Quick rule", 10, "F2", ACCENT)
        rule_text = (
            "If you can only improve one thing today, improve the structure first: rug size, lamp layer, and surface editing will change the room more than another decorative object."
        )
        self.text_block(62, 212, rule_text, 12, 470, leading=18, font="F3", color=BODY)

    def render_mistakes(self) -> None:
        self.title_block("Foundations", "Five mistakes that create instant visual noise")
        mistakes = [
            ("01", "Rug too small", "The seating area feels detached and the room loses its anchor."),
            ("02", "Only one light source", "The room feels flat, cold, and unfinished after sunset."),
            ("03", "Too many small objects", "Nothing becomes the hero, so everything feels like clutter."),
            ("04", "Curtains mounted low", "The wall feels shorter and the room looks less tailored."),
            ("05", "Furniture pushed to walls", "The room loses intimacy and the layout feels accidental."),
        ]
        y = 528
        for number, title, body in mistakes:
            self.rect_fill(42, y, 511, 82, PANEL)
            self.rect_stroke(42, y, 511, 82, LINE, 0.8)
            self.rect_fill(42, y, 66, 82, SOFT)
            self.text(62, y + 32, number, 20, "F2", ACCENT_DARK)
            self.text(126, y + 48, title, 16, "F2", BODY)
            self.text_block(126, y + 26, body, 10, 390, leading=14, font="F1", color=MUTED)
            y -= 96

    def render_palette(self, palette: Palette) -> None:
        self.title_block("Palette direction", palette.title, palette.subtitle)
        self.line(MARGIN, self.y, PAGE_W - MARGIN, self.y, LINE, 0.8)
        self.y -= 18
        swatch_x = MARGIN
        swatch_y = self.y
        swatch_w = 94
        gap = 10
        for index, (name, color) in enumerate(palette.colors):
            x = swatch_x + index * (swatch_w + gap)
            self.rect_fill(x, swatch_y - 72, swatch_w, 72, color)
            self.rect_stroke(x, swatch_y - 72, swatch_w, 72, LINE, 0.6)
            self.text(x, swatch_y - 90, name, 10, "F2", BODY)
        self.y = swatch_y - 132

        self.card(42, 308, 242, 184, "Where to use it", "", "Application")
        self.card(311, 308, 242, 184, "What keeps it premium", "", "Notes")

        cursor_left = 448
        for item in palette.use_cases:
            self.rect_fill(62, cursor_left - 3, 7, 7, ACCENT)
            wrapped = wrap_for_width(item, 10, 184)
            self.text(80, cursor_left - 1, wrapped[0], 10, "F1", BODY)
            cursor_left -= 14
            for line in wrapped[1:]:
                self.text(80, cursor_left - 1, line, 10, "F1", BODY)
                cursor_left -= 13
            cursor_left -= 10

        cursor_right = 448
        for item in palette.notes:
            self.rect_fill(331, cursor_right - 3, 7, 7, ACCENT)
            wrapped = wrap_for_width(item, 10, 184)
            self.text(349, cursor_right - 1, wrapped[0], 10, "F1", BODY)
            cursor_right -= 14
            for line in wrapped[1:]:
                self.text(349, cursor_right - 1, line, 10, "F1", BODY)
                cursor_right -= 13
            cursor_right -= 10

        self.rect_fill(42, 156, 511, 104, SOFT)
        self.text(62, 228, "Designer shortcut", 10, "F2", ACCENT_DARK)
        shortcut = "Choose one principal wood tone, one textile family, and one deeper anchor note. Repetition creates calm faster than more variety."
        self.text_block(62, 200, shortcut, 12, 470, leading=17, font="F3", color=BODY)

    def render_layout(self) -> None:
        self.title_block("Layout", "Simple rules that change the room first")
        self.card(42, 450, 160, 170, "Rug rule", "At least the front legs of the main seating pieces should sit on the rug. A too-small rug makes every other choice feel less refined.")
        self.card(218, 450, 160, 170, "Coffee table", "Aim for a table around two thirds of the sofa width. Keep roughly 35 to 45 cm between the table and the sofa edge.")
        self.card(394, 450, 160, 170, "Conversation", "Float at least one piece slightly off the wall if you can. Rooms usually feel better when seating relates to each other first.")

        self.rect_fill(42, 186, 511, 220, PANEL)
        self.rect_stroke(42, 186, 511, 220, LINE, 0.8)
        self.text(62, 378, "Quick layout sequence", 12, "F2", BODY)
        self.line(62, 346, 533, 346, LINE, 0.8)
        steps = [
            ("1", "Place the rug first."),
            ("2", "Center the sofa or main seat to the zone, not necessarily to the wall."),
            ("3", "Add the coffee table and keep enough breathing room around it."),
            ("4", "Use one lamp or side chair to complete the conversation arc."),
        ]
        x_positions = [72, 192, 322, 442]
        for (number, label), x in zip(steps, x_positions):
            self.rect_fill(x, 284, 42, 42, SOFT)
            self.text(x + 14, 300, number, 16, "F2", ACCENT_DARK)
            self.text_block(x - 4, 258, label, 10, 104, leading=13, font="F1", color=MUTED)

    def render_layers(self) -> None:
        self.title_block("Layers", "Light, textiles, and material balance")
        self.card(42, 456, 160, 176, "Lighting", "Use at least one ambient source, one task or reading source, and one softer atmospheric lamp. Evening light should flatter the room, not expose it.")
        self.card(218, 456, 160, 176, "Textiles", "Mix one smoother textile, one soft textile, and one tactile accent. Matching everything exactly usually makes the room flatter, not calmer.")
        self.card(394, 456, 160, 176, "Materials", "Pair timber, stone, glass, and metal with restraint. Let one material dominate and the others support.")

        self.rect_fill(42, 194, 511, 220, SOFT)
        self.text(62, 382, "The easiest premium combination", 11, "F2", BODY)
        formula = [
            "Neutral sofa or seating anchor",
            "Warm floor or timber note",
            "Soft off-white curtain layer",
            "One deeper contrast element",
            "One metal detail only",
        ]
        cursor = 344
        for item in formula:
            self.rect_fill(62, cursor - 3, 8, 8, ACCENT)
            self.text(82, cursor - 1, item, 12, "F1", BODY)
            cursor -= 28

    def render_styling(self) -> None:
        self.title_block("Styling", "The shelf and surface formula")
        intro = "Every styled surface needs hierarchy. If every object is medium-sized and equally decorative, the room loses calm immediately."
        self.y = self.text_block(MARGIN, self.y, intro, 13, 500, leading=18, font="F1", color=MUTED) - 12
        self.card(42, 430, 160, 176, "1. Anchor", "Start with one larger shape: a bowl, stack of books, framed print, or sculptural vase.")
        self.card(218, 430, 160, 176, "2. Vertical", "Add one element with height: a branch, lamp, or framed object to lift the composition.")
        self.card(394, 430, 160, 176, "3. Pause", "Finish with a smaller accent and leave clear empty space around the grouping.")

        self.rect_fill(42, 196, 511, 188, PANEL)
        self.rect_stroke(42, 196, 511, 188, LINE, 0.8)
        self.text(62, 352, "Do", 11, "F2", ACCENT)
        self.text(300, 352, "Do not", 11, "F2", ACCENT)
        do_items = [
            "Repeat tones already present in the room.",
            "Let one object be dominant.",
            "Use books to create height changes.",
        ]
        dont_items = [
            "Fill every surface edge to edge.",
            "Mix too many tiny decorative objects.",
            "Treat shelves as storage and styling at the same time.",
        ]
        self.bullet_list(62, 322, do_items, width=180, size=10)
        self.bullet_list(300, 322, dont_items, width=180, size=10)

    def render_reset(self) -> None:
        self.title_block("Reset plan", "A seven-day living room refresh")
        timeline = [
            ("Day 1", "Remove visual noise and clear every horizontal surface."),
            ("Day 2", "Reposition the large pieces with better rug and coffee table spacing."),
            ("Day 3", "Fix the lighting layer by adding or moving at least one lamp."),
            ("Day 4", "Edit the textiles and keep only the strongest tones."),
            ("Day 5", "Style one surface well instead of styling every surface lightly."),
            ("Day 6", "Introduce atmosphere through scent, evening light, and one calming ritual."),
            ("Day 7", "Photograph the room and note what still feels unresolved."),
        ]
        y = 560
        for index, (day, text) in enumerate(timeline):
            self.rect_fill(58, y - 12, 28, 28, ACCENT if index == 0 else SOFT)
            self.text(66, y - 1, str(index + 1), 12, "F2", WHITE if index == 0 else ACCENT_DARK)
            self.text(106, y + 5, day, 13, "F2", BODY)
            self.text_block(106, y - 18, text, 11, 380, leading=15, font="F1", color=MUTED)
            self.line(72, y - 28, 72, y - 66, LINE, 1.2)
            y -= 78

    def render_audit(self) -> None:
        self.title_block("Worksheet", "A room audit before you buy anything new")
        self.rect_fill(42, 450, 511, 170, PANEL)
        self.rect_stroke(42, 450, 511, 170, LINE, 0.8)
        prompts = [
            "What already feels strong in the room?",
            "What makes the room feel visually noisy?",
            "Which one purchase would change the room most?",
            "What can be removed before anything is added?",
        ]
        y = 590
        for prompt in prompts:
            self.text(62, y, prompt, 11, "F2", BODY)
            self.line(62, y - 16, 525, y - 16, LINE, 0.8)
            self.line(62, y - 34, 525, y - 34, LINE, 0.8)
            y -= 40

        self.rect_fill(42, 196, 246, 208, SOFT)
        self.rect_fill(307, 196, 246, 208, SOFT)
        self.text(62, 374, "Keep", 12, "F2", BODY)
        self.text(327, 374, "Change", 12, "F2", BODY)
        for base_x in (62, 327):
            y = 342
            for _ in range(6):
                self.line(base_x, y, base_x + 206, y, LINE, 0.8)
                y -= 26

    def render_checklist(self) -> None:
        self.title_block("Checklist", "Priority shopping list and finishing touches")
        self.rect_fill(42, 248, 245, 364, PANEL)
        self.rect_fill(308, 248, 245, 364, PANEL)
        self.rect_stroke(42, 248, 245, 364, LINE, 0.8)
        self.rect_stroke(308, 248, 245, 364, LINE, 0.8)
        self.text(62, 580, "Priority pieces", 14, "F2", BODY)
        self.text(328, 580, "Optional finishing touches", 14, "F2", BODY)
        priority = [
            "Correctly sized rug for the seating zone",
            "Secondary lamp or reading light",
            "Curtains mounted higher and wider than the window",
            "One strong art direction or gallery plan",
            "One tactile throw or cushion group",
        ]
        optional = [
            "Ceramic tray or bowl",
            "Coffee table book stack",
            "Warm metal accent",
            "Subtle room scent",
            "One sculptural branch or stem",
        ]
        self.bullet_list(62, 546, priority, width=190, size=10)
        self.bullet_list(328, 546, optional, width=190, size=10)

    def render_closing(self) -> None:
        self.rect_fill(34, 118, PAGE_W - 68, 590, DARK)
        self.text(64, 652, "FINAL NOTE", 11, "F2", (0.82, 0.74, 0.66))
        self.text(64, 586, "A premium room is rarely louder.", 32, "F2", WHITE)
        self.text(64, 548, "It is usually calmer, clearer, and more edited.", 24, "F2", WHITE)
        manifesto = (
            "The best living rooms are built through selection rather than accumulation. "
            "When the palette is restrained, the lighting is layered, and the surfaces can breathe, "
            "the room starts to feel intentional on its own."
        )
        self.text_block(64, 482, manifesto, 14, 446, leading=21, font="F3", color=(0.90, 0.86, 0.82))
        self.rect_fill(64, 256, 446, 136, SOFT)
        self.text(86, 352, "Three reminders", 11, "F2", ACCENT_DARK)
        reminders = [
            "Edit first. Shop second.",
            "Let proportion lead before decor does.",
            "Warmth comes from repetition, texture, and light restraint.",
        ]
        cursor = 320
        for item in reminders:
            self.rect_fill(86, cursor - 3, 7, 7, ACCENT)
            self.text(104, cursor - 1, item, 12, "F1", BODY)
            cursor -= 30
        self.text(64, 200, "Created for quieter homes, slower styling, and rooms that feel collected rather than crowded.", 12, "F1", (0.82, 0.74, 0.66))

    def render(self, page: dict) -> str:
        kind = page["kind"]
        if kind == "cover":
            self.render_cover()
        elif kind == "contents":
            self.render_contents()
        elif kind == "note":
            self.render_note()
        elif kind == "divider":
            self.divider_page(page["number"], page["title"], page["subtitle"])
        elif kind == "signals":
            self.render_signals()
        elif kind == "mistakes":
            self.render_mistakes()
        elif kind == "palette":
            self.render_palette(page["palette"])
        elif kind == "layout":
            self.render_layout()
        elif kind == "layers":
            self.render_layers()
        elif kind == "styling":
            self.render_styling()
        elif kind == "reset":
            self.render_reset()
        elif kind == "audit":
            self.render_audit()
        elif kind == "checklist":
            self.render_checklist()
        elif kind == "closing":
            self.render_closing()
        return "\n".join(self.ops)


def build_pdf(page_streams: list[str], output_path: Path) -> None:
    objects: list[tuple[str, str]] = []

    def add_object(kind: str, value: str) -> int:
        objects.append((kind, value))
        return len(objects)

    font_regular = add_object("plain", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold = add_object("plain", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    font_italic = add_object("plain", "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>")

    content_refs: list[int] = []
    for stream in page_streams:
        content_refs.append(add_object("stream", stream))

    pages_ref = len(objects) + 1
    objects.append(("plain", ""))

    page_refs: list[int] = []
    for content_ref in content_refs:
        page_refs.append(
            add_object(
                "plain",
                (
                    f"<< /Type /Page /Parent {pages_ref} 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
                    f"/Contents {content_ref} 0 R /Resources << /Font << "
                    f"/F1 {font_regular} 0 R /F2 {font_bold} 0 R /F3 {font_italic} 0 R >> >> >>"
                ),
            )
        )

    kids = " ".join(f"{ref} 0 R" for ref in page_refs)
    objects[pages_ref - 1] = ("plain", f"<< /Type /Pages /Count {len(page_refs)} /Kids [{kids}] >>")
    catalog_ref = add_object("plain", f"<< /Type /Catalog /Pages {pages_ref} 0 R >>")

    buffer = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]

    for index, (kind, value) in enumerate(objects, start=1):
        offsets.append(len(buffer))
        buffer.extend(f"{index} 0 obj\n".encode("ascii"))
        if kind == "stream":
            raw = value.encode("ascii")
            buffer.extend(f"<< /Length {len(raw)} >>\nstream\n".encode("ascii"))
            buffer.extend(raw)
            buffer.extend(b"\nendstream\n")
        else:
            buffer.extend(value.encode("ascii"))
            buffer.extend(b"\n")
        buffer.extend(b"endobj\n")

    xref_offset = len(buffer)
    buffer.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    buffer.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        buffer.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    buffer.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_ref} 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(buffer)


def main() -> None:
    page_count = len(PAGES)
    streams: list[str] = []
    for index, page in enumerate(PAGES, start=1):
        canvas = PageCanvas(index, page_count)
        streams.append(canvas.render(page))
    build_pdf(streams, OUTPUT_PATH)
    print(f"Generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
