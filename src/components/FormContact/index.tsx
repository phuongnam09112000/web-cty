import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import ContactLink from "../../common/ContactLink";
import {
  ContactContainer,
  ContentWrapper,
  InfoPanel,
  InfoEyebrow,
  InfoHeading,
  InfoDivider,
  InfoTagline,
  InfoItems,
  InfoItem,
  InfoIcon,
  InfoText,
  InfoLabel,
  InfoValue,
  FormContainer,
  FormTitle,
  FormHeading,
  FormDivider,
  FormField,
  Input,
  TextArea,
  SubmitButton,
  SuccessMessage,
  ErrorMessage,
} from "./styles";

interface FormDataProps {
  fullname: string;
  phone: string;
  email: string;
  message: string;
}

const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25A2.25 2.25 0 015.25 3h1.372c.516 0 .966.351 1.091.852l1.106 4.423a1.125 1.125 0 01-.26 1.06l-1.548 1.548a11.064 11.064 0 005.556 5.556l1.548-1.548a1.125 1.125 0 011.06-.26l4.423 1.106c.5.125.852.575.852 1.091V18.75A2.25 2.25 0 0118.75 21C9.563 21 3 14.437 3 5.25z" />
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const LocationIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormDataProps>({
    fullname: "", phone: "", email: "", message: "",
  });
  const [isVisible,    setIsVisible]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { root: null, threshold: 0.15, rootMargin: "0px" }
    );
    if (formRef.current) observer.observe(formRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      fullname: formData.fullname,
      phone: formData.phone,
      message: formData.message,
      receiver: "string",
      receiverEmail: "dpnam@istt.com.vn",
      subject: "Thong bao tu Web Cong Ty",
      from: formData.email,
    };
    try {
      const response = await fetch("https://istt.com.vn/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSubmitStatus(response.ok ? "success" : "error");
      if (response.ok) setFormData({ fullname: "", phone: "", email: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(""), 5000);
    }
  };

  const vis = isVisible ? "visible" : "";

  return (
    <ContactContainer ref={formRef}>
      <ContentWrapper>

        {/* Left: info panel */}
        <InfoPanel>
          <InfoEyebrow className={vis}>{t("contact.eyebrow")}</InfoEyebrow>
          <InfoHeading className={vis}>
            {t("contact.heading.part1")}&nbsp;<em>{t("contact.heading.em")}</em>
          </InfoHeading>
          <InfoDivider className={vis} />
          <InfoTagline className={vis}>{t("contact.tagline")}</InfoTagline>

          <InfoItems className={vis}>
            <InfoItem>
              <InfoIcon><PhoneIcon /></InfoIcon>
              <InfoText>
                <InfoLabel>{t("contact.info.phone.label")}</InfoLabel>
                <InfoValue><ContactLink type="tel" value={t("contact.info.phone.value")} /></InfoValue>
              </InfoText>
            </InfoItem>
            <InfoItem>
              <InfoIcon><MailIcon /></InfoIcon>
              <InfoText>
                <InfoLabel>{t("contact.info.email.label")}</InfoLabel>
                <InfoValue><ContactLink type="mailto" value={t("contact.info.email.value")} /></InfoValue>
              </InfoText>
            </InfoItem>
            <InfoItem>
              <InfoIcon><LocationIcon /></InfoIcon>
              <InfoText>
                <InfoLabel>{t("contact.info.address.label")}</InfoLabel>
                <InfoValue>{t("contact.info.address.value")}</InfoValue>
              </InfoText>
            </InfoItem>
          </InfoItems>
        </InfoPanel>

        {/* Right: form card */}
        <FormContainer className={vis}>
          <FormTitle className={vis}>{t("contact.form.eyebrow")}</FormTitle>
          <FormHeading className={vis}>
            <em>{t("contact.form.heading.em")}</em>&nbsp;{t("contact.form.heading.part2")}
          </FormHeading>
          <FormDivider className={vis} />

          <form onSubmit={handleSubmit}>
            <FormField className={isVisible ? "visible-1" : ""}>
              <Input type="text" name="fullname"
                placeholder={t("contact.form.field.fullname")}
                aria-label={t("contact.form.field.fullname")} autoComplete="name"
                value={formData.fullname} onChange={handleChange} required />
            </FormField>
            <FormField className={isVisible ? "visible-2" : ""}>
              <Input type="tel" name="phone"
                placeholder={t("contact.form.field.phone")}
                aria-label={t("contact.form.field.phone")} autoComplete="tel"
                value={formData.phone} onChange={handleChange} required />
            </FormField>
            <FormField className={isVisible ? "visible-3" : ""}>
              <Input type="email" name="email"
                placeholder={t("contact.form.field.email")}
                aria-label={t("contact.form.field.email")} autoComplete="email"
                value={formData.email} onChange={handleChange} required />
            </FormField>
            <FormField className={isVisible ? "visible-4" : ""}>
              <TextArea name="message"
                placeholder={t("contact.form.field.message")}
                aria-label={t("contact.form.field.message")}
                value={formData.message} onChange={handleChange} />
            </FormField>

            {submitStatus === "success" && (
              <SuccessMessage role="status">{t("contact.status.success")}</SuccessMessage>
            )}
            {submitStatus === "error" && (
              <ErrorMessage role="alert">{t("contact.status.error")}</ErrorMessage>
            )}

            <SubmitButton type="submit" className={vis} disabled={isSubmitting}>
              <span>{isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}</span>
            </SubmitButton>
          </form>
        </FormContainer>

      </ContentWrapper>
    </ContactContainer>
  );
};

export default ContactForm;