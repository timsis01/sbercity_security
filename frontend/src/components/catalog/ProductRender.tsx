/**
 * Объёмные SVG-модели товаров: по изображению сразу понятно, что это за устройство или лицензия.
 * Все модели рисуются в общей «студии» 400×300 с единым светом, тенью и палитрой бренда.
 */
import { useId } from "react";
import type { ReactNode } from "react";

/** Функция, возвращающая ссылку на градиент текущего рисунка. */
type Paint = (name: GradientName) => string;

/** Имя общего градиента. */
type GradientName = "body" | "side" | "dark" | "glass" | "screen" | "red" | "redSide" | "paper" | "metal" | "glow" | "redGlow" | "studio";

/** Функция отрисовки модели. */
type Renderer = (paint: Paint) => ReactNode;

/**
 * Общие градиенты: металл, тёмный пластик, стекло, экран, красный корпус, бумага.
 *
 * @param props Префикс идентификаторов.
 * @returns Элемент `defs`.
 */
function Gradients({ id }: { id: string }): ReactNode {
  return (
    <defs>
      <radialGradient id={`${id}-studio`} cx="50%" cy="38%" r="75%">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.65" stopColor="#eef3f5" />
        <stop offset="1" stopColor="#dde5e9" />
      </radialGradient>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fbfcfd" />
        <stop offset="1" stopColor="#d3dce0" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c4cfd4" />
        <stop offset="1" stopColor="#95a5ac" />
      </linearGradient>
      <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3c484d" />
        <stop offset="1" stopColor="#141a1d" />
      </linearGradient>
      <radialGradient id={`${id}-glass`} cx="35%" cy="30%" r="80%">
        <stop offset="0" stopColor="#6f8f9c" />
        <stop offset="0.45" stopColor="#1f3138" />
        <stop offset="1" stopColor="#070b0d" />
      </radialGradient>
      <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1c2a30" />
        <stop offset="1" stopColor="#0b1114" />
      </linearGradient>
      <linearGradient id={`${id}-red`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#b8281c" />
        <stop offset="0.45" stopColor="#ec5a45" />
        <stop offset="1" stopColor="#a4241a" />
      </linearGradient>
      <linearGradient id={`${id}-redSide`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c7392b" />
        <stop offset="1" stopColor="#8e1d14" />
      </linearGradient>
      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#eef2f4" />
      </linearGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8d9aa0" />
        <stop offset="0.5" stopColor="#e9eef0" />
        <stop offset="1" stopColor="#7d8b91" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#41b496" stopOpacity="0.55" />
        <stop offset="1" stopColor="#41b496" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-redGlow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#ff5a3c" stopOpacity="0.6" />
        <stop offset="1" stopColor="#ff5a3c" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/**
 * Мягкая тень предмета на полу студии.
 *
 * @param props Центр и ширина тени.
 * @returns Эллипс тени.
 */
function Shadow({ x = 200, width = 150 }: { x?: number; width?: number }): ReactNode {
  return <ellipse cx={x} cy={262} rx={width} ry={12} fill="#151b1e" opacity={0.12} />;
}

/**
 * Условная «картинка с камеры»: двор с домом, деревом и человеком.
 *
 * @param props Положение и размер кадра, признак выделения рамкой.
 * @returns Группа элементов кадра.
 */
function CameraFeed({ x, y, w, h, highlight = false }: { x: number; y: number; w: number; h: number; highlight?: boolean }): ReactNode {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#2b3b42" />
      <rect x={x} y={y + h * 0.62} width={w} height={h * 0.38} fill="#3d5159" />
      <rect x={x + w * 0.08} y={y + h * 0.18} width={w * 0.34} height={h * 0.44} fill="#4f666f" />
      <rect x={x + w * 0.12} y={y + h * 0.26} width={w * 0.07} height={h * 0.08} fill="#9fb6bf" />
      <rect x={x + w * 0.25} y={y + h * 0.26} width={w * 0.07} height={h * 0.08} fill="#9fb6bf" />
      <circle cx={x + w * 0.78} cy={y + h * 0.4} r={h * 0.16} fill="#3f7a64" />
      <rect x={x + w * 0.77} y={y + h * 0.5} width={w * 0.025} height={h * 0.16} fill="#2b3b42" />
      <circle cx={x + w * 0.56} cy={y + h * 0.5} r={h * 0.065} fill="#d9e2e6" />
      <rect x={x + w * 0.53} y={y + h * 0.57} width={w * 0.06} height={h * 0.2} fill="#d9e2e6" />
      {highlight ? <rect x={x + w * 0.48} y={y + h * 0.38} width={w * 0.16} height={h * 0.44} fill="none" stroke="#41b496" strokeWidth={1.6} /> : null}
      <circle cx={x + 6} cy={y + 6} r={2.2} fill="#ff5a3c" />
    </g>
  );
}

/**
 * Монитор на подставке; содержимое экрана рисуется в области 74…326 × 54…204.
 *
 * @param props Отрисовщик градиентов и содержимое экрана.
 * @returns Группа элементов монитора.
 */
function Monitor({ paint, children }: { paint: Paint; children: ReactNode }): ReactNode {
  return (
    <g>
      <Shadow width={120} />
      <path d="M176 212 h48 l10 40 h-68 z" fill={paint("side")} />
      <ellipse cx={200} cy={252} rx={70} ry={10} fill={paint("side")} />
      <ellipse cx={200} cy={249} rx={70} ry={9} fill={paint("body")} />
      <rect x={62} y={42} width={276} height={174} rx={8} fill={paint("dark")} />
      <rect x={74} y={54} width={252} height={150} fill={paint("screen")} />
      {children}
      <path d="M74 54 h120 l-60 150 h-60 z" fill="#ffffff" opacity={0.05} />
      <circle cx={200} cy={210} r={2} fill="#41b496" />
    </g>
  );
}

/**
 * Терминал распознавания лиц на стойке; содержимое экрана — 152…248 × 70…190.
 *
 * @param props Отрисовщик градиентов и дополнительные элементы экрана.
 * @returns Группа элементов терминала.
 */
function FaceTerminal({ paint, children }: { paint: Paint; children?: ReactNode }): ReactNode {
  return (
    <g>
      <Shadow width={80} />
      <rect x={190} y={214} width={20} height={44} fill={paint("side")} />
      <ellipse cx={200} cy={258} rx={44} ry={8} fill={paint("side")} />
      <rect x={136} y={40} width={128} height={180} rx={16} fill={paint("dark")} />
      <circle cx={200} cy={54} r={5} fill={paint("glass")} />
      <rect x={152} y={70} width={96} height={124} rx={4} fill="#13232a" />
      <circle cx={200} cy={118} r={22} fill="#7f98a2" />
      <path d="M164 194 c4 -30 18 -44 36 -44 s32 14 36 44 z" fill="#7f98a2" />
      <path d="M168 84 v-8 h12 M232 76 h12 v8 M168 162 v8 h12 M232 170 h12 v-8" stroke="#41b496" strokeWidth={3} fill="none" />
      <rect x={160} y={200} width={80} height={10} rx={5} fill="#1f2b30" />
      <rect x={160} y={200} width={58} height={10} rx={5} fill="#41b496" />
      {children}
    </g>
  );
}

/**
 * Круглый значок-бейдж поверх модели.
 *
 * @param props Центр и содержимое значка.
 * @returns Группа значка.
 */
function Badge({ x, y, children }: { x: number; y: number; children: ReactNode }): ReactNode {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={30} fill="#41b496" />
      <circle r={30} fill="none" stroke="#ffffff" strokeWidth={4} />
      <g stroke="#ffffff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </g>
  );
}

/**
 * Блок реле «Прометей» на DIN-рейке с заданным числом каналов и сигнальной лампой.
 *
 * @param paint Отрисовщик градиентов.
 * @param channels Число каналов (4, 8 или 16).
 * @returns Группа элементов блока.
 */
function relayBox(paint: Paint, channels: number): ReactNode {
  const width = channels === 16 ? 240 : channels === 8 ? 180 : 130;
  const left = 170 - width / 2;
  const columns = Math.min(channels, 8);
  const rows = Math.ceil(channels / 8);
  const step = (width - 30) / columns;
  return (
    <g>
      <Shadow x={190} width={width / 2 + 60} />
      <rect x={left - 20} y={150} width={width + 40} height={14} fill={paint("metal")} />
      <path d={`M${left} 96 h${width} l14 -12 h${-width} z`} fill={paint("body")} />
      <path d={`M${left + width} 96 l14 -12 v134 l-14 12 z`} fill={paint("side")} />
      <rect x={left} y={96} width={width} height={134} fill={paint("body")} />
      <rect x={left + 10} y={150} width={width - 20} height={34} fill="#e9eef0" stroke="#c9d3d8" />
      {Array.from({ length: columns }, (_, column) => (
        <g key={column}>
          <circle cx={left + 22 + column * step} cy={110} r={6} fill={paint("metal")} stroke="#7d8b91" />
          <path d={`M${left + 19 + column * step} 110 h6`} stroke="#4d616a" strokeWidth={1.5} />
          <circle cx={left + 22 + column * step} cy={216} r={6} fill={paint("metal")} stroke="#7d8b91" />
          <path d={`M${left + 19 + column * step} 216 h6`} stroke="#4d616a" strokeWidth={1.5} />
          {Array.from({ length: rows }, (_, row) => (
            <g key={row}>
              <circle cx={left + 22 + column * step} cy={132 + row * 8} r={3} fill={(column + row) % 3 === 0 ? "#ff5a3c" : "#41b496"} />
            </g>
          ))}
        </g>
      ))}
      <text x={left + width / 2} y={172} textAnchor="middle" fontSize={12} fontWeight={700} fill="#4d616a" fontFamily="Manrope Variable, sans-serif">
        PROMETHEUS-{channels}
      </text>
      <rect x={334} y={110} width={10} height={140} fill={paint("side")} />
      <ellipse cx={339} cy={250} rx={22} ry={6} fill={paint("side")} />
      <circle cx={339} cy={96} r={30} fill={paint("redGlow")} />
      <rect x={326} y={78} width={26} height={22} rx={4} fill="#ff5a3c" />
      <rect x={326} y={100} width={26} height={12} fill="#f4b740" opacity={0.75} />
      <rect x={326} y={112} width={26} height={12} fill="#41b496" opacity={0.6} />
    </g>
  );
}

const renderers: Record<string, Renderer> = {
  "dome-camera": (paint) => (
    <g>
      <Shadow width={110} />
      <ellipse cx={200} cy={92} rx={112} ry={26} fill={paint("side")} />
      <ellipse cx={200} cy={86} rx={112} ry={26} fill={paint("body")} />
      <path d="M116 102 A84 84 0 0 0 284 102 Z" fill={paint("glass")} />
      <circle cx={200} cy={146} r={28} fill="#0b1013" />
      <circle cx={200} cy={146} r={18} fill={paint("glass")} />
      <circle cx={193} cy={139} r={5} fill="#ffffff" opacity={0.7} />
      <path d="M132 112 A72 72 0 0 0 170 168" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={200} cy={102} rx={92} ry={18} fill={paint("body")} />
      <ellipse cx={200} cy={104} rx={84} ry={13} fill={paint("side")} />
      <circle cx={262} cy={92} r={4} fill="#41b496" />
      <g fill="#ff5a3c" opacity={0.7}>
        <circle cx={172} cy={146} r={2.5} />
        <circle cx={228} cy={146} r={2.5} />
      </g>
    </g>
  ),
  "bullet-camera": (paint) => (
    <g>
      <Shadow width={140} />
      <rect x={58} y={92} width={36} height={104} rx={6} fill={paint("side")} />
      <rect x={52} y={88} width={34} height={104} rx={6} fill={paint("body")} />
      <rect x={84} y={130} width={74} height={20} fill={paint("side")} />
      <circle cx={160} cy={140} r={18} fill={paint("dark")} />
      <rect x={156} y={102} width={176} height={78} rx={20} fill={paint("body")} />
      <rect x={156} y={148} width={176} height={32} rx={16} fill={paint("side")} opacity={0.7} />
      <path d="M146 96 h200 l-12 16 h-184 z" fill={paint("dark")} />
      <ellipse cx={330} cy={141} rx={16} ry={38} fill={paint("dark")} />
      <ellipse cx={333} cy={141} rx={10} ry={24} fill={paint("glass")} />
      <ellipse cx={331} cy={133} rx={3} ry={6} fill="#ffffff" opacity={0.7} />
      <circle cx={196} cy={120} r={4} fill="#41b496" />
      <text x={250} y={140} textAnchor="middle" fontSize={14} fontWeight={800} fill="#7d95a1" fontFamily="Manrope Variable, sans-serif">
        IP
      </text>
    </g>
  ),
  server: (paint) => (
    <g>
      <Shadow width={150} />
      {[0, 1].map((unit) => {
        const y = 92 + unit * 76;
        return (
          <g key={unit}>
            <path d={`M70 ${y} h220 l40 -26 h-220 z`} fill={paint("body")} />
            <path d={`M290 ${y} l40 -26 v68 l-40 26 z`} fill={paint("side")} />
            <rect x={70} y={y} width={220} height={68} fill={paint("dark")} />
            {Array.from({ length: 6 }, (_, bay) => (
              <g key={bay}>
                <rect x={80 + bay * 30} y={y + 10} width={24} height={48} rx={2} fill="#25323a" stroke="#3f4f57" />
                <circle cx={92 + bay * 30} cy={y + 50} r={2.4} fill={bay % 4 === 0 ? "#f4b740" : "#41b496"} />
              </g>
            ))}
            <rect x={262} y={y + 12} width={18} height={44} fill="#25323a" />
            <circle cx={271} cy={y + 22} r={4} fill="#41b496" />
          </g>
        );
      })}
    </g>
  ),
  "monitor-grid": (paint) => (
    <Monitor paint={paint}>
      <CameraFeed x={78} y={58} w={120} h={70} />
      <CameraFeed x={202} y={58} w={120} h={70} highlight />
      <CameraFeed x={78} y={132} w={120} h={68} />
      <CameraFeed x={202} y={132} w={120} h={68} />
    </Monitor>
  ),
  "monitor-settings": (paint) => (
    <Monitor paint={paint}>
      <CameraFeed x={80} y={60} w={130} h={80} />
      <CameraFeed x={80} y={144} w={130} h={54} />
      <rect x={216} y={60} width={104} height={138} fill="#1a262b" />
      {[0, 1, 2, 3, 4].map((row) => (
        <g key={row}>
          <rect x={226} y={78 + row * 24} width={84} height={4} rx={2} fill="#3d5159" />
          <rect x={226} y={78 + row * 24} width={30 + row * 11} height={4} rx={2} fill="#41b496" />
          <circle cx={256 + row * 11} cy={80 + row * 24} r={5} fill="#ffffff" />
        </g>
      ))}
      <circle cx={300} cy={190} r={0} />
    </Monitor>
  ),
  "monitor-filmstrip": (paint) => (
    <Monitor paint={paint}>
      <CameraFeed x={80} y={60} w={240} h={96} highlight />
      {[0, 1, 2, 3, 4].map((frame) => (
        <rect key={frame} x={80 + frame * 49} y={164} width={44} height={26} fill={frame === 2 ? "#41b496" : "#3d5159"} opacity={frame === 2 ? 0.9 : 1} />
      ))}
      <rect x={80} y={195} width={240} height={3} fill="#3d5159" />
      <rect x={174} y={192} width={4} height={9} fill="#41b496" />
    </Monitor>
  ),
  "monitor-map": (paint) => (
    <Monitor paint={paint}>
      <rect x={84} y={64} width={232} height={130} fill="#e9eef0" />
      <g stroke="#7d95a1" strokeWidth={3} fill="none">
        <path d="M84 64 h232 v130 h-232 z M170 64 v70 M170 156 v38 M240 64 v40 M240 126 v68 M84 134 h60 M190 134 h126" />
      </g>
      {[
        [110, 90],
        [206, 170],
        [290, 90],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <path d={`M${cx} ${cy} l40 -14 v28 z`} fill="#41b496" opacity={0.3} />
          <circle cx={cx} cy={cy} r={6} fill="#41b496" />
        </g>
      ))}
      <rect x={214} y={112} width={86} height={56} fill="#151b1e" />
      <CameraFeed x={217} y={115} w={80} h={50} highlight />
    </Monitor>
  ),
  "monitor-dashboard": (paint) => (
    <Monitor paint={paint}>
      {[0, 1, 2].map((card) => (
        <g key={card}>
          <rect x={82 + card * 80} y={62} width={74} height={32} fill="#1f2c32" />
          <rect x={88 + card * 80} y={70} width={30} height={5} fill="#7d95a1" />
          <rect x={88 + card * 80} y={80} width={46} height={8} fill={card === 1 ? "#ff5a3c" : "#41b496"} />
        </g>
      ))}
      <rect x={82} y={100} width={150} height={96} fill="#1f2c32" />
      {[40, 62, 34, 70, 52, 80, 66].map((height, index) => (
        <rect key={index} x={92 + index * 19} y={188 - height} width={12} height={height} fill={index === 5 ? "#41b496" : "#4f666f"} />
      ))}
      <rect x={238} y={100} width={80} height={96} fill="#1f2c32" />
      <circle cx={278} cy={148} r={26} fill="none" stroke="#4f666f" strokeWidth={10} />
      <path d="M278 122 a26 26 0 1 1 -24.7 34" fill="none" stroke="#41b496" strokeWidth={10} />
    </Monitor>
  ),
  "monitor-pos": (paint) => (
    <Monitor paint={paint}>
      <rect x={74} y={54} width={252} height={150} fill="#2b3b42" />
      <rect x={74} y={150} width={252} height={54} fill="#5b4a3c" />
      <rect x={96} y={128} width={92} height={26} fill="#3d5159" />
      <circle cx={142} cy={96} r={14} fill="#d9e2e6" />
      <rect x={124} y={110} width={36} height={22} rx={8} fill="#41b496" />
      <rect x={214} y={62} width={104} height={134} fill="#ffffff" opacity={0.92} />
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <g key={line}>
          <rect x={222} y={74 + line * 16} width={56} height={5} fill={line === 3 ? "#ff5a3c" : "#7d95a1"} />
          <rect x={290} y={74 + line * 16} width={20} height={5} fill={line === 3 ? "#ff5a3c" : "#4d616a"} />
        </g>
      ))}
      <rect x={218} y={118} width={96} height={14} fill="none" stroke="#ff5a3c" strokeWidth={2} />
      <rect x={222} y={176} width={88} height={12} fill="#41b496" />
    </Monitor>
  ),
  "monitor-faces": (paint) => (
    <Monitor paint={paint}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((face) => {
        const x = 82 + (face % 4) * 61;
        const y = 62 + Math.floor(face / 4) * 70;
        const match = face === 5;
        return (
          <g key={face}>
            <rect x={x} y={y} width={56} height={64} fill="#1f2c32" stroke={match ? "#41b496" : "none"} strokeWidth={3} />
            <circle cx={x + 28} cy={y + 24} r={11} fill="#7f98a2" />
            <path d={`M${x + 10} ${y + 58} c2 -14 8 -20 18 -20 s16 6 18 20 z`} fill="#7f98a2" />
          </g>
        );
      })}
      <rect x={204} y={130} width={56} height={10} fill="#41b496" />
    </Monitor>
  ),
  "kiosk-lamp": (paint) => (
    <g>
      <Shadow width={110} />
      <circle cx={262} cy={54} r={44} fill={paint("redGlow")} />
      <rect x={256} y={70} width={10} height={60} fill={paint("side")} />
      <rect x={248} y={38} width={26} height={22} rx={4} fill="#ff5a3c" />
      <rect x={248} y={60} width={26} height={12} fill="#f4b740" opacity={0.7} />
      <path d="M130 150 h150 v100 h-150 z" fill={paint("body")} />
      <path d="M280 150 l22 -14 v100 l-22 14 z" fill={paint("side")} />
      <path d="M130 150 l22 -14 h150 l-22 14 z" fill={paint("body")} />
      <rect x={146} y={164} width={118} height={16} fill="#30454d" />
      <rect x={150} y={168} width={110} height={8} fill="#ff5a3c" opacity={0.6} />
      <rect x={148} y={196} width={44} height={6} fill="#c3cdd2" />
      <rect x={236} y={190} width={30} height={40} fill="#e9eef0" stroke="#c3cdd2" />
      <path d="M150 140 l18 -82 h84 l-18 82 z" fill={paint("dark")} />
      <path d="M160 132 l15 -66 h68 l-15 66 z" fill={paint("screen")} />
      <rect x={176} y={82} width={44} height={6} fill="#41b496" transform="skewX(-12)" />
      <rect x={176} y={96} width={34} height={5} fill="#7d95a1" transform="skewX(-12)" />
      <rect x={176} y={108} width={40} height={5} fill="#7d95a1" transform="skewX(-12)" />
    </g>
  ),
  "pos-register": (paint) => (
    <g>
      <Shadow width={140} />
      <path d="M200 30 v26" stroke="#7d95a1" strokeWidth={4} />
      <ellipse cx={200} cy={58} rx={22} ry={8} fill={paint("body")} />
      <path d="M180 60 a20 20 0 0 0 40 0 z" fill={paint("glass")} />
      <path d="M190 74 l-60 70 h140 z" fill="#41b496" opacity={0.12} />
      <path d="M80 196 h180 v56 h-180 z" fill={paint("body")} />
      <path d="M260 196 l30 -18 v56 l-30 18 z" fill={paint("side")} />
      <path d="M80 196 l30 -18 h180 l-30 18 z" fill={paint("body")} />
      <rect x={96} y={214} width={148} height={22} fill="#d3dce0" />
      <rect x={160} y={222} width={24} height={4} fill="#95a5ac" />
      <rect x={168} y={150} width={14} height={40} fill={paint("side")} />
      <path d="M108 86 h124 l8 72 h-140 z" fill={paint("dark")} />
      <path d="M118 96 h104 l6 54 h-116 z" fill={paint("screen")} />
      <rect x={126} y={106} width={60} height={6} fill="#41b496" />
      <rect x={126} y={120} width={86} height={4} fill="#7d95a1" />
      <rect x={126} y={130} width={70} height={4} fill="#7d95a1" />
      <rect x={290} y={150} width={60} height={40} rx={4} fill={paint("dark")} />
      <path d="M302 150 v-46 h36 v46" fill="#ffffff" stroke="#d3dce0" />
      {[0, 1, 2, 3].map((line) => (
        <rect key={line} x={308} y={114 + line * 8} width={24 - (line % 2) * 8} height={3} fill="#95a5ac" />
      ))}
    </g>
  ),
  "hand-wash": (paint) => (
    <g>
      <Shadow width={130} />
      <rect x={70} y={40} width={260} height={200} fill="#e9eef0" />
      <path d="M314 52 l-80 120 h80 z" fill="#41b496" opacity={0.14} />
      <ellipse cx={316} cy={50} rx={20} ry={7} fill={paint("body")} />
      <path d="M298 52 a18 18 0 0 0 36 0 z" fill={paint("glass")} />
      <path d="M160 108 v-20 a20 20 0 0 1 40 0 v6" stroke={paint("metal")} strokeWidth={10} fill="none" />
      <rect x={154} y={104} width={14} height={20} fill={paint("metal")} />
      {[0, 1, 2].map((drop) => (
        <path key={drop} d={`M${196 + drop * 4} ${112 + drop * 18} q4 8 0 12 q-4 -4 0 -12 z`} fill="#5aa9e6" />
      ))}
      <path d="M100 150 h200 l-18 60 h-164 z" fill={paint("body")} />
      <ellipse cx={200} cy={150} rx={100} ry={18} fill={paint("side")} />
      <ellipse cx={200} cy={150} rx={86} ry={12} fill="#f7f9fa" />
      <circle cx={200} cy={152} r={4} fill={paint("metal")} />
      <circle cx={262} cy={98} r={18} fill="#41b496" />
      <path d="m254 98 6 6 11 -12" stroke="#ffffff" strokeWidth={4} fill="none" />
    </g>
  ),
  "face-terminal": (paint) => <FaceTerminal paint={paint} />,
  "face-repeat": (paint) => (
    <g>
      <FaceTerminal paint={paint} />
      <Badge x={290} y={92}>
        <path d="M-12 -4 a13 13 0 0 1 23 -6 M11 4 a13 13 0 0 1 -23 6" />
        <path d="M11 -18 v8 h-8 M-11 18 v-8 h8" />
      </Badge>
    </g>
  ),
  "face-clock": (paint) => (
    <g>
      <FaceTerminal paint={paint} />
      <Badge x={290} y={92}>
        <circle r={15} />
        <path d="M0 -8 v8 l6 5" />
      </Badge>
    </g>
  ),
  "face-search": (paint) => (
    <g>
      <Shadow width={130} />
      {[2, 1, 0].map((card) => (
        <g key={card} transform={`translate(${110 + card * 26} ${70 - card * 14})`}>
          <rect width={120} height={150} rx={6} fill={paint("paper")} stroke="#c3cdd2" />
          <rect x={14} y={14} width={92} height={96} fill="#d3dce0" />
          <circle cx={60} cy={52} r={18} fill="#7f98a2" />
          <path d="M28 110 c4 -24 16 -34 32 -34 s28 10 32 34 z" fill="#7f98a2" />
          <rect x={14} y={120} width={70} height={6} fill="#95a5ac" />
          <rect x={14} y={132} width={48} height={6} fill="#c3cdd2" />
        </g>
      ))}
      <circle cx={170} cy={140} r={46} fill="#41b496" opacity={0.15} stroke="#41b496" strokeWidth={10} />
      <path d="M204 174 l46 46" stroke={paint("dark")} strokeWidth={18} strokeLinecap="round" />
    </g>
  ),
  "face-database": (paint) => (
    <g>
      <Shadow width={130} />
      {[2, 1, 0].map((level) => {
        const y = 96 + level * 50;
        return (
          <g key={level}>
            <path d={`M90 ${y} v40 a70 18 0 0 0 140 0 v-40`} fill={paint("side")} />
            <ellipse cx={160} cy={y} rx={70} ry={18} fill={paint("body")} />
            <circle cx={204} cy={y + 30} r={4} fill="#41b496" />
          </g>
        );
      })}
      <rect x={236} y={70} width={100} height={124} rx={8} fill={paint("dark")} />
      <circle cx={286} cy={116} r={22} fill="#7f98a2" />
      <path d="M254 184 c4 -28 16 -38 32 -38 s28 10 32 38 z" fill="#7f98a2" />
      <rect x={248} y={80} width={20} height={20} rx={4} fill="#41b496" />
      <path d="M253 90 v-3 a5 5 0 0 1 10 0 v3" stroke="#ffffff" strokeWidth={2} fill="none" />
    </g>
  ),
  "e-acts": (paint) => (
    <g>
      <Shadow width={130} />
      <rect x={110} y={34} width={180} height={226} rx={16} fill={paint("dark")} />
      <rect x={122} y={48} width={156} height={198} rx={4} fill={paint("paper")} />
      <rect x={136} y={64} width={90} height={9} fill="#151b1e" />
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <rect key={line} x={136} y={88 + line * 16} width={128 - (line % 3) * 22} height={5} fill="#c3cdd2" />
      ))}
      <path d="M140 210 c10 -16 18 10 28 -4 s14 -14 22 2 s14 4 20 -6" stroke="#2a4fa3" strokeWidth={2.5} fill="none" />
      <circle cx={244} cy={204} r={22} fill="none" stroke="#41b496" strokeWidth={4} />
      <path d="m234 204 7 7 13 -14" stroke="#41b496" strokeWidth={4} fill="none" />
      <path d="M300 90 l20 150" stroke={paint("side")} strokeWidth={8} strokeLinecap="round" />
      <text x={226} y={242} textAnchor="middle" fontSize={10} fontWeight={700} fill="#41b496" fontFamily="Manrope Variable, sans-serif">
        ПОДПИСАНО ЭП
      </text>
    </g>
  ),
  "smart-lock": (paint) => (
    <g>
      <Shadow width={100} />
      <rect x={110} y={24} width={180} height={238} fill="#e3d6c6" />
      <rect x={110} y={24} width={180} height={238} fill="none" stroke="#c9b9a5" strokeWidth={4} />
      <rect x={166} y={52} width={68} height={184} rx={14} fill={paint("dark")} />
      <rect x={176} y={66} width={48} height={70} rx={6} fill="#0f171a" />
      {Array.from({ length: 12 }, (_, key) => (
        <circle key={key} cx={186 + (key % 3) * 14} cy={76 + Math.floor(key / 3) * 16} r={4} fill={key === 4 ? "#41b496" : "#7d95a1"} opacity={0.9} />
      ))}
      <rect x={140} y={156} width={90} height={18} rx={9} fill={paint("metal")} />
      <circle cx={200} cy={165} r={14} fill={paint("metal")} stroke="#7d8b91" />
      <rect x={190} y={196} width={20} height={26} rx={10} fill="#0f171a" />
      <g stroke="#41b496" strokeWidth={5} fill="none" strokeLinecap="round">
        <path d="M300 64 a22 22 0 0 1 30 0" />
        <path d="M290 52 a38 38 0 0 1 50 0" />
      </g>
      <circle cx={315} cy={80} r={5} fill="#41b496" />
    </g>
  ),
  "camera-mast": (paint) => (
    <g>
      <Shadow width={120} />
      <path d="M200 236 l-74 22 M200 236 l74 22 M200 236 v24" stroke={paint("dark")} strokeWidth={7} strokeLinecap="round" />
      <rect x={194} y={60} width={12} height={180} fill={paint("metal")} />
      <rect x={176} y={186} width={48} height={40} rx={4} fill={paint("dark")} />
      <circle cx={214} cy={198} r={4} fill="#41b496" />
      <path d="M216 108 l84 -22 v46 l-84 22 z" fill="#1d3a6b" />
      <path d="M216 108 l84 -22 v46 l-84 22 z" fill="none" stroke="#9fb6bf" strokeWidth={2} />
      <path d="M244 101 v46 M272 94 v46 M216 131 l84 -22" stroke="#9fb6bf" strokeWidth={1.4} />
      <rect x={110} y={48} width={96} height={34} rx={12} fill={paint("body")} />
      <path d="M104 44 h108 l-6 10 h-96 z" fill={paint("dark")} />
      <ellipse cx={110} cy={65} rx={8} ry={16} fill={paint("dark")} />
      <ellipse cx={108} cy={65} rx={5} ry={10} fill={paint("glass")} />
      <path d="M104 70 l-80 60 h60 z" fill="#41b496" opacity={0.14} />
    </g>
  ),
  "mobile-tower": (paint) => (
    <g>
      <Shadow width={160} />
      <rect x={196} y={52} width={10} height={130} fill={paint("metal")} />
      <rect x={198} y={40} width={6} height={20} fill={paint("metal")} />
      {[-1, 1].map((side) => (
        <g key={side}>
          <rect x={side < 0 ? 150 : 206} y={40} width={46} height={20} rx={8} fill={paint("body")} />
          <ellipse cx={side < 0 ? 150 : 252} cy={50} rx={5} ry={10} fill={paint("glass")} />
        </g>
      ))}
      <path d="M80 182 h220 v46 h-220 z" fill={paint("body")} />
      <path d="M300 182 l26 -14 v46 l-26 14 z" fill={paint("side")} />
      <path d="M80 182 l26 -14 h220 l-26 14 z" fill={paint("body")} />
      <rect x={96} y={194} width={60} height={22} fill="#41b496" />
      <text x={126} y={210} textAnchor="middle" fontSize={11} fontWeight={800} fill="#ffffff" fontFamily="Manrope Variable, sans-serif">
        AI
      </text>
      <path d="M300 214 l40 16" stroke={paint("dark")} strokeWidth={6} />
      <circle cx={130} cy={238} r={18} fill={paint("dark")} />
      <circle cx={130} cy={238} r={7} fill={paint("metal")} />
      <circle cx={260} cy={238} r={18} fill={paint("dark")} />
      <circle cx={260} cy={238} r={7} fill={paint("metal")} />
      <g transform="translate(330 96)">
        <rect x={-26} y={-30} width={52} height={60} fill="none" stroke="#41b496" strokeWidth={3} strokeDasharray="8 6" />
        <path d="M0 20 c-14 0 -18 -12 -10 -22 c2 6 6 8 8 6 c-4 -10 2 -20 10 -24 c-2 10 12 14 8 28 c-2 8 -8 12 -16 12 z" fill="#ff7a3c" />
      </g>
    </g>
  ),
  "relay-4": (paint) => relayBox(paint, 4),
  "relay-8": (paint) => relayBox(paint, 8),
  "relay-16": (paint) => relayBox(paint, 16),
  "usb-key": (paint) => (
    <g>
      <Shadow width={120} />
      <g transform="rotate(-18 200 150)">
      <rect x={250} y={128} width={64} height={40} rx={3} fill={paint("metal")} />
      <rect x={266} y={138} width={12} height={8} fill="#5d6b71" />
      <rect x={290} y={138} width={12} height={8} fill="#5d6b71" />
      <rect x={90} y={112} width={170} height={74} rx={26} fill={paint("side")} />
      <rect x={90} y={106} width={170} height={70} rx={26} fill={paint("dark")} />
      <circle cx={114} cy={141} r={9} fill={paint("studio")} />
      <rect x={140} y={124} width={86} height={34} rx={6} fill="#25323a" />
      <text x={183} y={147} textAnchor="middle" fontSize={16} fontWeight={800} fill="#e9eef0" fontFamily="Manrope Variable, sans-serif">
        HASP
      </text>
      <circle cx={242} cy={141} r={9} fill={paint("glow")} />
      <circle cx={242} cy={141} r={4} fill="#41b496" />
      </g>
    </g>
  ),
  "board-game": () => (
    <g>
      <Shadow width={150} />
      <path d="M70 120 l140 -40 l130 40 l-140 44 z" fill="#1f6d5a" />
      <path d="M70 120 v60 l130 44 v-60 z" fill="#17594a" />
      <path d="M200 164 v60 l140 -44 v-60 z" fill="#124739" />
      <g transform="translate(205 122) scale(1 0.62) rotate(-45)">
        <path d="M0 -36 L30 -24 v22 c0 22 -14 34 -30 40 c-16 -6 -30 -18 -30 -40 v-22 z" fill="#ffffff" />
        <circle cx={0} cy={-6} r={12} fill="#41b496" />
      </g>
      {[0, 1].map((die) => (
        <g key={die} transform={`translate(${290 + die * 44} ${196 + die * 18})`}>
          <rect width={36} height={36} rx={6} fill="#ffffff" stroke="#c3cdd2" />
          <circle cx={10} cy={10} r={3.5} fill="#151b1e" />
          <circle cx={26} cy={26} r={3.5} fill="#151b1e" />
          {die === 1 ? <circle cx={18} cy={18} r={3.5} fill="#151b1e" /> : null}
        </g>
      ))}
    </g>
  ),
  certificate: (paint) => (
    <g>
      <Shadow width={140} />
      <rect x={78} y={54} width={244} height={176} fill={paint("paper")} stroke="#c3cdd2" />
      <rect x={90} y={66} width={220} height={152} fill="none" stroke="#41b496" strokeWidth={3} />
      <text x={180} y={112} textAnchor="middle" fontSize={20} fontWeight={800} fill="#151b1e" fontFamily="Manrope Variable, sans-serif">
        СЕРТИФИКАТ
      </text>
      <rect x={110} y={128} width={140} height={6} fill="#95a5ac" />
      <rect x={130} y={144} width={100} height={6} fill="#c3cdd2" />
      <rect x={112} y={190} width={70} height={3} fill="#95a5ac" />
      <path d="M262 196 l-10 50 l18 -10 l12 16 l4 -52 z" fill="#2f8f76" />
      <circle cx={268} cy={186} r={26} fill="#41b496" />
      <circle cx={268} cy={186} r={18} fill="none" stroke="#ffffff" strokeWidth={3} />
      <g transform="translate(212 -10)">
        <path d="M44 70 l52 -22 l52 22 l-52 22 z" fill={paint("dark")} />
        <path d="M66 80 v20 c18 12 42 12 60 0 v-20" fill={paint("dark")} />
        <path d="M148 70 v26" stroke="#f4b740" strokeWidth={3} />
        <circle cx={148} cy={98} r={4} fill="#f4b740" />
      </g>
    </g>
  ),
  "service-kit": (paint) => (
    <g>
      <Shadow width={150} />
      <path d="M150 128 v-20 h100 v20" stroke={paint("dark")} strokeWidth={10} fill="none" />
      <rect x={80} y={128} width={240} height={110} rx={8} fill="#41b496" />
      <rect x={80} y={128} width={240} height={30} rx={8} fill="#2f8f76" />
      <rect x={180} y={150} width={40} height={16} rx={3} fill={paint("metal")} />
      <path d="M100 116 l70 -70" stroke={paint("metal")} strokeWidth={10} strokeLinecap="round" />
      <circle cx={174} cy={42} r={14} fill="none" stroke={paint("metal")} strokeWidth={9} />
      <path d="M300 120 l-46 -60" stroke="#f4b740" strokeWidth={10} strokeLinecap="round" />
      <path d="M254 60 l-14 -18" stroke={paint("metal")} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={246} cy={196} rx={30} ry={9} fill={paint("body")} />
      <path d="M218 198 a28 28 0 0 0 56 0 z" fill={paint("glass")} />
      <path d="M120 194 h60 M120 210 h40" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
    </g>
  ),
  "fire-cable": (paint) => (
    <g>
      <Shadow width={160} />
      {[0, 1, 2].map((cable) => (
        <path key={cable} d={`M30 ${210 + cable * 10} C 120 ${200 + cable * 10}, 160 ${110 + cable * 10}, 370 ${100 + cable * 10}`} stroke={cable === 1 ? "#151b1e" : "#4d616a"} strokeWidth={10} fill="none" />
      ))}
      <g transform="rotate(-18 210 140)">
        <rect x={130} y={110} width={170} height={52} rx={26} fill={paint("red")} />
        <rect x={130} y={110} width={170} height={16} rx={8} fill="#ffffff" opacity={0.22} />
        <rect x={180} y={124} width={70} height={24} rx={4} fill="#ffffff" />
        <text x={215} y={141} textAnchor="middle" fontSize={12} fontWeight={800} fill="#c7392b" fontFamily="Manrope Variable, sans-serif">
          Б1
        </text>
        <rect x={146} y={104} width={10} height={64} rx={3} fill={paint("dark")} />
        <rect x={274} y={104} width={10} height={64} rx={3} fill={paint("dark")} />
      </g>
    </g>
  ),
  "fire-socket": (paint) => (
    <g>
      <Shadow width={110} />
      <rect x={116} y={46} width={176} height={200} rx={18} fill={paint("side")} />
      <rect x={108} y={40} width={176} height={200} rx={18} fill={paint("body")} />
      <circle cx={196} cy={140} r={62} fill={paint("side")} opacity={0.5} />
      <circle cx={196} cy={140} r={56} fill="#f7f9fa" stroke="#d3dce0" />
      <circle cx={174} cy={140} r={8} fill="#151b1e" />
      <circle cx={218} cy={140} r={8} fill="#151b1e" />
      <circle cx={262} cy={70} r={18} fill={paint("red")} />
      <circle cx={262} cy={70} r={8} fill="#ffffff" opacity={0.3} />
      <Badge x={300} y={200}>
        <path d="M0 12 c-10 0 -13 -9 -7 -16 c1 4 4 6 6 4 c-3 -7 1 -14 7 -17 c-1 7 9 10 6 20 c-1 6 -6 9 -12 9 z" fill="#ffffff" stroke="none" />
      </Badge>
    </g>
  ),
  "fire-panel": (paint) => (
    <g>
      <Shadow width={150} />
      <rect x={100} y={34} width={200} height={224} fill={paint("side")} />
      <rect x={110} y={44} width={180} height={204} fill="#e9eef0" />
      <path d="M300 34 l50 24 v224 l-50 -24 z" fill={paint("body")} />
      <rect x={120} y={120} width={160} height={10} fill={paint("metal")} />
      {Array.from({ length: 8 }, (_, breaker) => (
        <g key={breaker}>
          <rect x={124 + breaker * 19} y={100} width={16} height={50} fill="#ffffff" stroke="#c3cdd2" />
          <rect x={128 + breaker * 19} y={112} width={8} height={12} fill={breaker === 3 ? "#ff5a3c" : "#41b496"} />
        </g>
      ))}
      <path d="M130 170 c40 20 80 -10 140 20" stroke="#151b1e" strokeWidth={4} fill="none" />
      <path d="M130 186 c40 20 80 -10 140 20" stroke="#4d616a" strokeWidth={4} fill="none" />
      <ellipse cx={200} cy={66} rx={34} ry={14} fill={paint("redSide")} />
      <ellipse cx={200} cy={60} rx={34} ry={14} fill={paint("red")} />
      <text x={200} y={64} textAnchor="middle" fontSize={11} fontWeight={800} fill="#ffffff" fontFamily="Manrope Variable, sans-serif">
        А1
      </text>
    </g>
  ),
  "aerosol-generator": (paint) => (
    <g>
      <Shadow width={120} />
      <rect x={120} y={230} width={160} height={14} fill={paint("dark")} />
      <rect x={136} y={204} width={14} height={30} fill={paint("dark")} />
      <rect x={250} y={204} width={14} height={30} fill={paint("dark")} />
      <rect x={110} y={70} width={180} height={140} rx={20} fill={paint("red")} />
      {[0, 1, 2, 3, 4].map((rib) => (
        <rect key={rib} x={128 + rib * 34} y={74} width={6} height={132} fill="#ffffff" opacity={0.12} />
      ))}
      <ellipse cx={290} cy={140} rx={22} ry={70} fill={paint("redSide")} />
      <ellipse cx={292} cy={140} rx={14} ry={48} fill={paint("dark")} />
      {[0, 1, 2, 3, 4].map((slot) => (
        <rect key={slot} x={284} y={104 + slot * 16} width={16} height={6} rx={3} fill="#4d616a" />
      ))}
      <rect x={146} y={120} width={96} height={40} fill="#ffffff" />
      <text x={194} y={146} textAnchor="middle" fontSize={15} fontWeight={800} fill="#c7392b" fontFamily="Manrope Variable, sans-serif">
        FR-150
      </text>
    </g>
  ),
  "hand-extinguisher": (paint) => (
    <g>
      <Shadow width={130} />
      <g transform="rotate(-24 200 150)">
      <rect x={80} y={124} width={230} height={50} rx={25} fill={paint("red")} />
      <rect x={80} y={128} width={230} height={12} rx={6} fill="#ffffff" opacity={0.25} />
      <rect x={300} y={128} width={34} height={42} rx={8} fill={paint("dark")} />
      <circle cx={354} cy={149} r={14} fill="none" stroke={paint("metal")} strokeWidth={6} />
      <rect x={130} y={130} width={110} height={38} fill="#ffffff" />
      <text x={185} y={155} textAnchor="middle" fontSize={14} fontWeight={800} fill="#c7392b" fontFamily="Manrope Variable, sans-serif">
        РАФ-100П
      </text>
      <rect x={74} y={132} width={14} height={34} rx={4} fill={paint("dark")} />
      </g>
    </g>
  ),
};

/**
 * Проверяет, есть ли объёмная модель для ключа.
 *
 * @param visual Ключ модели из API.
 * @returns `true`, если модель нарисована.
 */
export function hasRender(visual: string | null | undefined): boolean {
  return Boolean(visual && visual in renderers);
}

/** Свойства объёмной модели. */
interface ProductRenderProps {
  visual: string;
  title: string;
  className?: string;
}

/**
 * Отрисовывает объёмную модель товара в «студии».
 *
 * @param props Ключ модели, название для доступности и класс.
 * @returns SVG-изображение или `null`, если модели нет.
 */
export function ProductRender({ visual, title, className }: ProductRenderProps): ReactNode {
  const id = useId().replace(/:/g, "");
  const renderer = renderers[visual];
  if (!renderer) {
    return null;
  }
  const paint: Paint = (name) => `url(#${id}-${name})`;
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label={title} data-visual={visual}>
      <Gradients id={id} />
      <rect x={-200} y={-200} width={800} height={700} fill={paint("studio")} />
      {renderer(paint)}
    </svg>
  );
}
