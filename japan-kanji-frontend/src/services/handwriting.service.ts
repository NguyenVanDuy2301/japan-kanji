export type StrokePoint = {
  x: number;
  y: number;
  t: number;
};

export type Stroke = StrokePoint[];

export const handwritingService = {
  recognizeKanji: async (
    strokes: Stroke[],
    canvasWidth: number,
    canvasHeight: number
  ): Promise<string[]> => {
    if (strokes.length === 0) return [];

    try {
      const ink = strokes.map((stroke) => {
        const xArr = stroke.map((p) => p.x);
        const yArr = stroke.map((p) => p.y);
        const tArr = stroke.map((p) => p.t - stroke[0].t);
        return [xArr, yArr, tArr];
      });

      const payload = {
        options: "enable_pre_space",
        requests: [
          {
            writing_guide: {
              writing_area_width: canvasWidth,
              writing_area_height: canvasHeight,
            },
            ink: ink,
            language: "ja",
          },
        ],
      };

      const response = await fetch(
        "https://inputtools.google.com/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data[0] === "SUCCESS" && data[1] && data[1][0] && data[1][0][1]) {
        const results: string[] = data[1][0][1];
        return results.filter((c) => c.length === 1).slice(0, 15);
      }
      return [];
    } catch (error) {
      console.error("Handwriting recognition failed:", error);
      throw error;
    }
  },
};
