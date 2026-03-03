import sys

with open('src/app/pick/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

render_card_def = """  const renderCard = (i: number, prefix: string, isFirst: boolean) => {
    const cardData = MAJOR_ARCANA[i];
    const selectedData = selectedCards.find((card) => card.cardIndex === i);
    const isSelected = Boolean(selectedData);
    const isHovered = hoveredCard === i;
    const isReversed = selectedData?.isReversed ?? false;
    const order = selectedCards.findIndex((card) => card.cardIndex === i) + 1;

    const zIndex =
      exitPhase === "scatter" && isSelected
        ? 400
        : isSelected
          ? 320 + i
          : isHovered
            ? 220 + i
            : i;

    const sv = scatterValues[i];

    const cardAnimate =
      exitPhase === "scatter"
        ? isSelected
          ? { y: -340, opacity: 0, scale: 1.1, x: 0, rotate: 0 }
          : { x: sv.x, y: sv.y, rotate: sv.rotate, opacity: 0, scale: 0.4 }
        : { y: isSelected ? -30 : 0, scale: isSelected ? 1.05 : 1, x: 0, opacity: 1 };

    const cardTransition =
      exitPhase === "scatter"
        ? isSelected
          ? { duration: 1.1, delay: 0.28, ease: [0.22, 0, 0.1, 1] as [number, number, number, number] }
          : { duration: 0.62, delay: sv.delay, ease: [0.4, 0, 1, 1] as [number, number, number, number] }
        : { duration: 0.6, ease: "easeOut" as const };

    return (
      <motion.div
        key={`${prefix}-${i}`}
        data-tarot-card="true"
        onMouseEnter={() => !isDragging && exitPhase === "idle" && setHoveredCard(i)}
        onMouseLeave={() => setHoveredCard((prev) => (prev === i ? null : prev))}
        onClick={() => {
          if (suppressClickRef.current || isDragging) return;
          toggleCard(i);
        }}
        whileHover={exitPhase === "idle" ? { y: isSelected ? -30 : -20 } : undefined}
        animate={cardAnimate}
        transition={cardTransition}
        className={`relative shrink-0 cursor-pointer h-[190px] w-[128px] md:h-[256px] md:w-[172px] ${
          isFirst ? "ml-0" : prefix === "pc" ? "md:-ml-[45px] -ml-[85px]" : "-ml-[85px]"
        }`}
        style={{ zIndex, perspective: "1000px" }}
      >
        {isSelected && exitPhase === "scatter" && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0] }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(232,201,106,0.6) 0%, transparent 70%)",
              filter: "blur(10px)",
            }}
          />
        )}

        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isSelected ? 180 : 0 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              filter: isSelected
                ? "drop-shadow(0 0 20px rgba(212,175,55,0.6))"
                : "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
              overflow: "visible",
            }}
          >
            <img
              src="/cards/back_00.jpg"
              alt="타로 카드 뒷면"
              draggable={false}
              className="h-full w-full object-contain bg-[#1A0A00] rounded-lg moonlight-glow"
            />
          </div>

          <div
            className="absolute inset-0 rounded-lg"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              filter: isSelected
                ? "drop-shadow(0 0 20px rgba(212,175,55,0.6))"
                : "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
              overflow: "visible",
            }}
          >
            <motion.img
              src={`/cards/major_${String(i).padStart(2, "0")}.jpg`}
              alt={cardData.name}
              draggable={false}
              className="h-full w-full object-contain bg-[#0A0503] rounded-lg"
              animate={{ rotate: isReversed ? 180 : 0 }}
              transition={{ duration: 1.5 }}
            />
            {isReversed && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-[#8B1A1A]/50 to-transparent rounded-lg"
                animate={{ opacity: [0.18, 0.45, 0.18] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {isSelected && (
              <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none overflow-hidden rounded-b-lg">
                {Array.from({ length: 15 }).map((_, pIdx) => (
                  <motion.div
                    key={`dust-${pIdx}`}
                    className="absolute bottom-4 w-[2px] h-[2px] md:w-1 md:h-1 rounded-full bg-[#D4AF37]"
                    initial={{ opacity: 0, x: "50%", y: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 0.9, 0],
                      x: `${50 + (Math.random() * 100 - 50)}%`,
                      y: - (Math.random() * 80 + 30),
                      scale: Math.random() * 1.5 + 0.5
                    }}
                    transition={{
                      duration: 1.2 + Math.random() * 0.8,
                      delay: 1.1 + Math.random() * 0.4,
                      ease: "easeOut"
                    }}
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      boxShadow: "0 0 8px #D4AF37",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center w-full whitespace-nowrap"
            style={{ bottom: "-65px" }}
          >
            <span
              className="mb-1 text-[9px] md:text-[10px] font-medium tracking-[0.1em] text-[#e8c96a] uppercase font-serif drop-shadow-md"
            >
              {cardData.id === 0 ? "0" : cardData.id}. {cardData.original}
            </span>
            <span
              className="text-[12px] md:text-[14px] font-bold tracking-[0.15em] text-[#fef9f0] font-serif drop-shadow-lg"
            >
              {cardData.name}
            </span>
          </motion.div>
        )}

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
            style={{ top: "-55px" }}
          >
            <div className="rounded-full bg-black/70 px-6 py-2.5 backdrop-blur-md border border-[#e8c96a]/40 shadow-[0_0_15px_rgba(232,201,106,0.2)] flex items-center justify-center">
              <span className="text-[12px] md:text-[14px] font-serif tracking-[0.1em] text-[#fef9f0] drop-shadow-[0_0_8px_rgba(232,201,106,0.8)]">
                {order === 1 ? "과거 (첫 번째 패)" : order === 2 ? "현재 (두 번째 패)" : "미래 (세 번째 패)"}
              </span>
            </div>
          </motion.div>
        )}

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: exitPhase === "scatter" ? 0 : 1, y: 0 }}
            transition={{
              delay: exitPhase === "scatter" ? 0 : 1.2,
              duration: 0.5,
            }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-40"
            style={{ bottom: "12px" }}
          >
            <div
              className={`relative px-3 py-1 rounded-md font-semibold text-[10px] tracking-widest backdrop-blur-md shadow-xl border ${isReversed
                ? "bg-[#2A0505]/90 text-[#FF8888] border-[#8B1A1A]/80"
                : "bg-[#1A0A00]/90 text-[#D4AF37] border-[#D4AF37]/60"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-md" />
              <span className="relative drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                {isReversed ? "逆" : "正"}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };
"""

target1 = '  return (\n    <main className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#DCD8C0]">'
new_content1 = render_card_def + '\n' + target1

content = content.replace(target1, new_content1)

target2_start = '            <div\n              className="relative flex min-w-max items-center justify-start pr-24"\n              style={{ paddingTop: "180px", paddingBottom: "122px" }}\n            >'
target2_end = '              })}\n            </div>'

idx1 = content.find(target2_start)
idx2 = content.find(target2_end) + len(target2_end)

new_section_layout = """            {/* 모바일 2줄 레이아웃 (md:hidden) */}
            <div className="flex flex-col md:hidden w-max justify-center" style={{ paddingTop: "60px", paddingBottom: "20px", gap: "28px" }}>
              <div className="flex items-center justify-start pr-24">
                {Array.from({ length: 11 }).map((_, i) => renderCard(i, "mob1", i === 0))}
              </div>
              <div className="flex items-center justify-start pr-24">
                {Array.from({ length: 11 }).map((_, i) => renderCard(i + 11, "mob2", i === 0))}
              </div>
            </div>

            {/* PC 1줄 레이아웃 (hidden md:flex) */}
            <div
              className="hidden md:flex relative min-w-max items-center justify-start pr-24"
              style={{ paddingTop: "180px", paddingBottom: "122px" }}
            >
              {Array.from({ length: 22 }).map((_, i) => renderCard(i, "pc", i === 0))}
            </div>"""

if idx1 != -1 and idx2 != -1:
    content = content[:idx1] + new_section_layout + content[idx2:]
else:
    print("Could not find targets")
    sys.exit(1)

with open('src/app/pick/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied")
