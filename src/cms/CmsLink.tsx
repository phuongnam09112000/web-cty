import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string };

const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

const CmsLink = forwardRef<HTMLAnchorElement, Props>(({ to, children, ...rest }, ref) => {
  if (to.startsWith("/") && !to.startsWith("//")) {
    return (
      <Link ref={ref} to={to} {...rest}>
        {children}
      </Link>
    );
  }
  if (EXTERNAL.test(to)) {
    const mailOrTel = /^(mailto|tel):/i.test(to);
    return (
      <a
        ref={ref}
        href={to}
        {...(mailOrTel ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <a ref={ref} href={to} {...rest}>
      {children}
    </a>
  );
});

export default CmsLink;
