/* Visible content box of each logo file, measured by drawing the image to a
 * canvas and ignoring transparent and near-white pixels. `crop` is
 * [left, top, right, bottom] as fractions of the image; `ratio` is the width
 * / height of that visible box. Used to trim built-in margins and give every
 * logo a similar visual weight. Re-measure if a logo file is replaced. */
export interface LogoMetrics {
  crop: [number, number, number, number];
  ratio: number;
}

export const logoMetrics: Record<string, LogoMetrics> = {
  "/img/partner/oracle.png": { crop: [0.051, 0.28, 0.952, 0.72], ratio: 7.959 },
  "/img/partner/ceragon.png": { crop: [0.042, 0.392, 0.958, 0.614], ratio: 4.119 },
  "/img/partner/paloalto.png": { crop: [0.024, 0.381, 0.976, 0.619], ratio: 5.333 },
  "/img/partner/cisco.png": { crop: [0.175, 0.153, 0.825, 0.841], ratio: 1.892 },
  "/img/partner/dell.png": { crop: [0, 0, 1, 1], ratio: 1 },
  "/img/partner/elbit.png": { crop: [0.013, 0.012, 0.987, 0.986], ratio: 2.877 },
  "/img/partner/f5.png": { crop: [0.005, 0, 0.99, 1], ratio: 1.074 },
  "/img/partner/hpe.png": { crop: [0.123, 0.289, 0.877, 0.711], ratio: 2.388 },
  "/img/partner/everbridge.svg": { crop: [0, 0, 1, 1], ratio: 5.085 },
  "/img/partner/allot.png": { crop: [0.141, 0.201, 0.838, 0.677], ratio: 2.3 },
  "/img/partner/aaronia.png": { crop: [0.196, 0.286, 0.793, 0.704], ratio: 2.038 },
  "/img/partner/corsight.png": { crop: [0.051, 0.202, 0.961, 0.852], ratio: 5.222 },
  "/img/partner/cynapse.png": { crop: [0.001, 0.028, 1, 0.972], ratio: 5.479 },
  "/img/partner/bosch.png": { crop: [0.074, 0.333, 0.913, 0.712], ratio: 4.441 },
  "/img/partner/nokia.svg": { crop: [0, 0, 1, 1], ratio: 4.325 },
  "/img/partner/hcltech.svg": { crop: [0, 0, 1, 1], ratio: 5.464 },
  "/img/partner/dsit_solutions.jpeg": { crop: [0.075, 0.172, 0.92, 0.688], ratio: 3.521 },
  "/img/partner/mavenir.png": { crop: [0.075, 0.28, 0.925, 0.72], ratio: 5.564 },
  "/img/partner/fortinet.png": { crop: [0.124, 0.411, 0.875, 0.589], ratio: 8.403 },
  "/img/partner/microsoft.png": { crop: [0.027, 0.111, 0.973, 0.889], ratio: 4.684 },
  "/img/partner/arista.png": { crop: [0.028, 0.155, 0.974, 0.778], ratio: 6.395 },
  "/img/partner/infinera.jpeg": { crop: [0, 0, 1, 1], ratio: 4.003 },
  "/img/partner/dopikai.png": { crop: [0.012, 0.052, 0.978, 0.95], ratio: 3.823 },
  "/img/customer/bqp.png": { crop: [0, 0, 1, 0.996], ratio: 0.982 },
  "/img/customer/bca.png": { crop: [0.017, 0.037, 0.983, 0.963], ratio: 1.274 },
  "/img/customer/bgd.png": { crop: [0.093, 0.04, 0.915, 0.951], ratio: 0.995 },
  "/img/customer/vnpt.png": { crop: [0.172, 0.069, 0.817, 0.94], ratio: 0.797 },
  "/img/customer/viettel.png": { crop: [0, 0, 1, 1], ratio: 5.013 },
  "/img/customer/mobifone.png": { crop: [0, 0, 1, 1], ratio: 6.316 },
  "/img/customer/gtel.svg": { crop: [0, 0, 1, 1], ratio: 2.679 },
  "/img/customer/mb.png": { crop: [0.059, 0.087, 0.947, 0.908], ratio: 2.407 },
  "/img/customer/agribank.png": { crop: [0.005, 0.048, 0.995, 0.986], ratio: 1.338 },
  "/img/customer/evn.png": { crop: [0.047, 0.089, 0.953, 0.932], ratio: 2.203 },
};
