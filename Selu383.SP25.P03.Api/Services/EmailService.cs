using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;

namespace Selu383.SP25.P03.Api.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _smtpServer;
        private readonly int _port;
        private readonly string _username;
        private readonly string _password;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? throw new InvalidOperationException("SMTP server not configured");
            _port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
            _username = _configuration["EmailSettings:Username"] ?? throw new InvalidOperationException("SMTP username not configured");
            _password = _configuration["EmailSettings:Password"] ?? throw new InvalidOperationException("SMTP password not configured");
            _fromEmail = _configuration["EmailSettings:FromEmail"] ?? throw new InvalidOperationException("From email not configured");
            _fromName = _configuration["EmailSettings:FromName"] ?? "Movie Theater";
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            using var client = new SmtpClient(_smtpServer, _port)
            {
                Credentials = new NetworkCredential(_username, _password),
                EnableSsl = true
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(to);

            await client.SendMailAsync(message);
        }
    }
}
