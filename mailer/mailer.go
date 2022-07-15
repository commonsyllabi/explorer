package mailer

import (
	"context"
	"os"
	"time"

	"github.com/mailgun/mailgun-go/v4"

	zero "github.com/commonsyllabi/explorer/api/logger"
)

const DOMAIN = "post.enframed.net"

func SendMail(_dest string, _body string, _subject string) error {
	mg := mailgun.NewMailgun(DOMAIN, os.Getenv("MAILGUN_PRIVATE_API_KEY"))
	mg.SetAPIBase("https://api.eu.mailgun.net/v3") //-- rgpd mon amour

	sender := "Common Syllabi <cosyl@post.enframed.net>"
	subject := _subject
	body := _body
	recipient := _dest
	message := mg.NewMessage(sender, subject, body, recipient)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	_, _, err := mg.Send(ctx, message)
	if err != nil {
		zero.Errorf("error sending email: %v", err)
		return err
	}

	return nil
}
