import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { emailStyles } from "./email-styles";

interface TeacherRecessStudentEmailProps {
  studentName: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  fallbackLessonTitle: string;
}

export const TeacherRecessStudentEmail = ({
  studentName,
  teacherName,
  startDate,
  endDate,
  fallbackLessonTitle,
}: TeacherRecessStudentEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Seu professor {teacherName} estará de recesso de {startDate} a {endDate}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.h1}>Olá, {studentName}! 📢</Heading>
          <Section style={emailStyles.section}>
            <Text style={emailStyles.text}>
              Seu professor(a) <strong>{teacherName}</strong> estará de recesso entre <strong>{startDate}</strong> e <strong>{endDate}</strong>.
            </Text>
            <Text style={emailStyles.text}>
              Durante esse período sua(s) aula(s) ficará(ão) pausada(s). Para você continuar praticando, preparamos a seguinte atividade:
            </Text>
            <Section style={emailStyles.highlightSection}>
              <Text style={emailStyles.highlightText}>{fallbackLessonTitle}</Text>
            </Section>
            <Text style={{ ...emailStyles.text, color: "#666", fontSize: "14px" }}>
              Suas aulas voltarão ao normal automaticamente após o fim do recesso.
            </Text>
          </Section>
          <Text style={emailStyles.footer}>
            Equipe Fluency Lab
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TeacherRecessStudentEmail;
