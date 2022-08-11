package mailer

import (
	"context"
	"os"
	"time"

	"github.com/mailgun/mailgun-go/v4"
)

const DOMAIN = "post.enframed.net"

func SendMail(_dest string, _subject string, _body string) error {
	var err error
	if os.Getenv("API_MODE") == "test" {
		os.Setenv("MAILGUN_PRIVATE_API_KEY", "pubkey-9e6707d57ed1aab274ac62786539c158")
	}
	mg := mailgun.NewMailgun(DOMAIN, os.Getenv("MAILGUN_PRIVATE_API_KEY"))
	mg.SetAPIBase("https://api.eu.mailgun.net/v3") //-- rgpd mon amour

	sender := "Common Syllabi <cosyl@post.enframed.net>"
	subject := _subject
	body := _body
	recipient := _dest
	message := mg.NewMessage(sender, subject, body, recipient)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	if os.Getenv("API_MODE") != "test" {
		_, _, err = mg.Send(ctx, message)
	}

	return err
}
