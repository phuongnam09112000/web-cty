export interface BusinessArea {
  /** Short id, used for element ids */
  id: string;
  titleKey: string;
  descriptionKey: string;
  /** Route of the area's solution page */
  link: string;
  /** Large photograph (also used on the area's own page) */
  image: string;
  /** CSS object-position, keeps the subject in frame when cropped */
  imagePosition?: string;
}
