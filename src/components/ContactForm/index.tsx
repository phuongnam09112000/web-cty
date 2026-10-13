import React, { useState } from "react";
import { Form, Modal } from "antd";
import { useTranslation } from "react-i18next";
import ContactLink from "../../common/ContactLink";
import {
  ContactContainer,
  InnerWrapper,
  LeftPanel,
  PanelTop,
  PanelEyebrow,
  PanelTitle,
  PanelDivider,
  PanelDesc,
  PanelBottom,
  ContactInfoItem,
  ContactInfoIcon,
  ContactInfoTexts,
  ContactInfoLabel,
  ContactInfoValue,
  RightPanel,
  FormEyebrow,
  FormHeading,
  FormDivider,
  StyledForm,
  FieldGrid,
  FullRow,
  StyledFormItem,
  ContentFormItem,
  StyledInput,
  ContactFormTextArea,
  SubmitButtonContainer,
  SubmitButton,
  ModalContainer,
  ThankYouTitle,
  ThankYouText,
} from "./styles";

/* ─── Inline SVG icons ───────────────────────── */
const BuildingIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 016 0v4" />
  </svg>
);
const MailIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.375L2.25 6.75" />
  </svg>
);
const PhoneIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.06.26l-1.548 1.548a11.064 11.064 0 01-5.556-5.556l1.548-1.548a1.125 1.125 0 00.26-1.06L9.342 4.602a1.125 1.125 0 00-1.091-.852H6.75A2.25 2.25 0 004.5 6z" />
  </svg>
);

/* ─── Component ──────────────────────────────── */
const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        fullname: values.fullname,
        phone:    values.phone,
        message:  values.message,
        receiver: "string",
        receiverEmail: "ptha@istt.com.vn",
        subject: "Thong bao tu Web Cong Ty",
        from: values.email,
      };
      const response = await fetch("https://istt.com.vn/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed");
      setIsModalVisible(true);
      form.resetFields();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContactContainer>
        <InnerWrapper>

          {/* ── Left dark panel ── */}
          <LeftPanel>
            <PanelTop>
              <PanelEyebrow>{t("contact.eyebrow")}</PanelEyebrow>
              <PanelTitle as="h1">
                {t("contact.heading.part1")}&nbsp;<em>{t("contact.heading.em")}</em>
              </PanelTitle>
              <PanelDivider />
              <PanelDesc>{t("contact.tagline")}</PanelDesc>
            </PanelTop>

            <PanelBottom>
              <ContactInfoItem>
                <ContactInfoIcon><BuildingIcon /></ContactInfoIcon>
                <ContactInfoTexts>
                  <ContactInfoLabel>{t("contact.info.address.label")}</ContactInfoLabel>
                  <ContactInfoValue>{t("contact.info.address.value")}</ContactInfoValue>
                </ContactInfoTexts>
              </ContactInfoItem>

              <ContactInfoItem>
                <ContactInfoIcon><MailIcon /></ContactInfoIcon>
                <ContactInfoTexts>
                  <ContactInfoLabel>{t("contact.info.email.label")}</ContactInfoLabel>
                  <ContactInfoValue><ContactLink type="mailto" value={t("contact.info.email.value")} /></ContactInfoValue>
                </ContactInfoTexts>
              </ContactInfoItem>

              <ContactInfoItem>
                <ContactInfoIcon><PhoneIcon /></ContactInfoIcon>
                <ContactInfoTexts>
                  <ContactInfoLabel>{t("contact.info.phone.label")}</ContactInfoLabel>
                  <ContactInfoValue><ContactLink type="tel" value={t("contact.info.phone.value")} /></ContactInfoValue>
                </ContactInfoTexts>
              </ContactInfoItem>
            </PanelBottom>
          </LeftPanel>

          {/* ── Right form panel ── */}
          <RightPanel>
            <FormEyebrow>{t("contact.form.eyebrow")}</FormEyebrow>
            <FormHeading as="h2">
              <em>{t("contact.form.heading.em")}</em>&nbsp;{t("contact.form.heading.part2")}
            </FormHeading>
            <FormDivider />

            <StyledForm form={form} name="contactForm" onFinish={handleSubmit} layout="vertical">
              <FieldGrid>
                <StyledFormItem
                  name="fullname"
                  rules={[{ required: true, message: t("contact.validation.fullname") }]}
                >
                  <StyledInput placeholder={t("contact.form.field.fullname") + " *"} aria-label={t("contact.form.field.fullname")} aria-required="true" autoComplete="name" />
                </StyledFormItem>

                <StyledFormItem
                  name="phone"
                  rules={[{ required: true, message: t("contact.validation.phone") }]}
                >
                  <StyledInput placeholder={t("contact.form.field.phone") + " *"} aria-label={t("contact.form.field.phone")} aria-required="true" autoComplete="tel" />
                </StyledFormItem>
              </FieldGrid>

              <FullRow>
                <StyledFormItem
                  name="email"
                  rules={[
                    { required: true, message: t("contact.validation.email.required") },
                    { type: "email",  message: t("contact.validation.email.invalid")  },
                  ]}
                >
                  <StyledInput placeholder={t("contact.form.field.email") + " *"} aria-label={t("contact.form.field.email")} aria-required="true" autoComplete="email" />
                </StyledFormItem>
              </FullRow>

              <FullRow>
                <ContentFormItem
                  name="message"
                  rules={[{ required: true, message: t("contact.validation.message") }]}
                >
                  <ContactFormTextArea placeholder={t("contact.form.field.message")} aria-label={t("contact.form.field.message")} aria-required="true" rows={5} />
                </ContentFormItem>
              </FullRow>

              <SubmitButtonContainer>
                <SubmitButton type="primary" htmlType="submit" loading={loading}>
                  <span style={{color:"#fff"}}>{loading ? t("contact.form.submitting") : t("contact.form.submit")}</span>
                </SubmitButton>
              </SubmitButtonContainer>
            </StyledForm>
          </RightPanel>

        </InnerWrapper>
      </ContactContainer>

      {/* ── Success modal ── */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
        width={460}
        bodyStyle={{ padding: 0 }}
      >
        <ModalContainer>
          <ThankYouTitle>
            {t("contact.modal.title.part1")}&nbsp;<em>{t("contact.modal.title.em")}</em>
          </ThankYouTitle>
          <ThankYouText>{t("contact.modal.body")}</ThankYouText>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default ContactForm;