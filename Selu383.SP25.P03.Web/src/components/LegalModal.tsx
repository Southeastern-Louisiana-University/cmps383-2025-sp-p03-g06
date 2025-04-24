// src/components/LegalModal.tsx
import { Modal, Box, Text, Title, ScrollArea, Divider } from "@mantine/core";
import { useState, useEffect } from "react";

interface LegalModalProps {
  opened: boolean;
  onClose: () => void;
  type: "privacy" | "terms";
}

const PrivacyMarkdown = `**Privacy Policy for Lions Den Cinemas**  
*Effective Date: April 23, 2025*  

## Introduction  

Lions Den Cinemas (“Company,” “we,” “us,” or “our”) is committed to safeguarding your privacy. This Policy explains how we collect, use, disclose, and protect information when you use our website or mobile application (collectively, the “Services”).  

## Information We Collect  

**Personal Data**  

- Contact details (name, email, phone)  
- Payment information (credit/debit card data)  
- Reservation details (booking date, time, seats)  

**Non-Personal Data**  

- Device and usage data (IP address, browser type, pages visited)  
- Analytics (clickstream, performance metrics)  

## How We Use Your Information  

We process your information to:  

- Provide, operate, and maintain our Services  
- Manage reservations and process payments  
- Send confirmations, alerts, and marketing communications (*with consent*)  
- Improve and personalize your experience  
- Comply with legal obligations  

## Sharing and Disclosure  

We may share data with:  

- Service providers (e.g., payment processors)  
- Legal or regulatory authorities, where required by law  
- Successors in the event of a merger or sale  

We **do not** sell or lease your personal information to third parties.  

## Data Security  

We implement industry-standard safeguards (encryption, access controls) to protect your data. However, no system is completely impervious to intrusion.  

## Cookies and Tracking  

Our Services use cookies and similar technologies to enhance functionality and analytics. You can manage these via your browser settings.  

## Children’s Privacy  

Our Services are not intended for children under 13. We do not knowingly collect personal data from minors without parental consent.  

## Your Rights  

Subject to applicable law, you may:  

- Access, correct, or delete your personal data  
- Object to or restrict processing  
- Withdraw consent for marketing communications  

To exercise these rights, email us at **privacy@lionsdencinemas.com**.  

## Changes to This Policy  

We may update this Policy periodically. We will post the revised date here and notify you of significant changes.  

## Contact Us  

Lions Den Cinemas  
Attn: Privacy Team  
(999) 999-9999  
privacy@lionsdencinemas.com  
www.lionsdencinemas.com
`;

const TermsMarkdown = `**Terms of Service for Lions Den Cinemas**  
*Effective Date: April 23, 2025*  

## 1. Acceptance of Terms  

By accessing or using the Lions Den Cinemas website and mobile application (“Services”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree, please do not use our Services.  

## 2. Eligibility and Account Registration  

You must be at least 18 years old to register. You agree to provide accurate information and to safeguard your account credentials.  

## 3. Reservations and Payments  

All bookings require full payment at the time of reservation. We reserve the right to cancel unpaid or fraudulent bookings.  

## 4. Cancellations and Refunds  

- **Full refund** for cancellations made ≥2 hours before showtime  
- **No refund** for cancellations <2 hours before showtime  
- Refunds processed to the original payment method within 5–10 business days  

## 5. Intellectual Property  

All content (text, graphics, logos, software) is owned by Lions Den Cinemas or its licensors. Unauthorized use is prohibited.  

## 6. User Conduct  

You agree not to:  

- Use our Services for unlawful or deceptive purposes  
- Interfere with the operation or security of our platform  
- Share or sell your account credentials  

## 7. Disclaimers and Limitation of Liability  

Our Services are provided “as is.” Lions Den Cinemas disclaims all warranties, and to the fullest extent permitted by law, will not be liable for indirect, incidental, or consequential damages.  

## 8. Indemnification  

You agree to indemnify and hold us harmless from any claims arising from your misuse of the Services or violation of these Terms.  

## 9. Governing Law  

These Terms are governed by the laws of the State of Louisiana. Disputes will be resolved in the courts of Louisiana.  

## 10. Changes to Terms  

We may revise these Terms at any time. Significant updates will be communicated via email or in-app notification.  

## Contact Information  

Lions Den Cinemas  
Legal Department  
(999) 999-9999  
legal@lionsdencinemas.com  
www.lionsdencinemas.com
`;

const LegalModal = ({ opened, onClose, type }: LegalModalProps) => {
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (type === "privacy") {
      setTitle("Privacy Policy");
      setContent(PrivacyMarkdown);
    } else {
      setTitle("Terms of Service");
      setContent(TermsMarkdown);
    }
  }, [type]);

  const processedContent = () =>
    content.split("\n").map((rawLine, idx) => {
      const line = rawLine.trim();

      // true blank line → insert an empty div (or <br />)
      if (line === "") {
        return <Box key={idx} my="sm" />;
      }

      // headings
      if (line.startsWith("##")) {
        return (
          <Title
            key={idx}
            order={4}
            mt={20}
            mb={10}
            style={{
              borderBottom: "2px solid var(--primary-color)",
              paddingBottom: 5,
              color: "var(--primary-color)",
            }}
          >
            {line.replace(/^##\s*/, "")}
          </Title>
        );
      }

      // bold + italic parsing
      // split on **bold**
      const boldSplit = line.split(/\*\*(.*?)\*\*/g);
      const withBold = boldSplit.map((chunk, i) =>
        i % 2 === 1 ? (
          <Text key={`b-${idx}-${i}`} fw={700} span>
            {chunk}
          </Text>
        ) : (
          chunk
        )
      );

      // within each, split on *italic*
      const final = withBold.map((part, j) => {
        if (typeof part === "string") {
          return part.split(/\*(.*?)\*/g).map((sub, k) =>
            k % 2 === 1 ? (
              <Text key={`i-${idx}-${j}-${k}`} fs="italic" span>
                {sub}
              </Text>
            ) : (
              sub
            )
          );
        }
        return part;
      });

      return (
        <Text key={idx} component="div" style={{ lineHeight: 1.7 }}>
          {final}
        </Text>
      );
    });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding="xl"
      title={
        <Title
          order={2}
          style={{
            color: "var(--primary-color)",
            borderBottom: "3px solid var(--primary-color)",
            paddingBottom: 10,
            width: "100%",
          }}
        >
          {title}
        </Title>
      }
      styles={{
        header: { marginBottom: 10, width: "100%" },
        title: { textAlign: "center", fontWeight: "bold" },
        body: { padding: "0 20px" },
      }}
      overlayProps={{ backgroundOpacity: 0.65, blur: 3 }}
      centered
    >
      <Divider mb={20} />
      <ScrollArea h={500} offsetScrollbars scrollbarSize={6}>
        <Box
          style={{
            padding: "1rem",
            background: "var(--bg-color)",
            color: "var(--text-color)",
          }}
        >
          {processedContent()}
        </Box>
      </ScrollArea>
    </Modal>
  );
};

export default LegalModal;
