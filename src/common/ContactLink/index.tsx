import styled from "styled-components";

// Makes a displayed phone number or e-mail address tappable (tel: / mailto:)
// while keeping the surrounding text style.
const Anchor = styled.a`
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-decoration: none;
  overflow-wrap: anywhere;

  &:hover {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

interface ContactLinkProps {
  type: "tel" | "mailto";
  value: string;
}

const ContactLink = ({ type, value }: ContactLinkProps) => {
  const target = type === "tel" ? value.replace(/[^\d+]/g, "") : value.trim();
  return <Anchor href={`${type}:${target}`}>{value}</Anchor>;
};

export default ContactLink;
