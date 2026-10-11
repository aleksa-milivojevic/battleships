import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NestMailerService {
    constructor(private service: MailerService) {}

    async mailBanInformation(to: string, ) {
        try {
            await this.service.sendMail({
                to,
                subject: 'Vaš nalog je trajno banovan',
                html:
                    `<div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.5;">
                        <h2 style="color: #2c3e50;">Vaš nalog je trajno banovan</h2>
                        <p>Na osnovu prijava drugih igrača, administrator igre je odlučio da je Vaš nalog potrebno ukloniti iz igre.
                        Nalog će biti vraćen u upotrebu ukoliko administrator donese takvu odluku.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 0.9em; color: #7f8c8d;">Ovo je automatski generisana poruka, molimo Vas da ne odgovarate direktno na ovaj email.</p>
                        <p>Pozdrav,<br><strong>Battleships</strong></p>
                    </div>`
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    async mailTimeoutInformation(to: string, until: string) {
        try {
            const result = await this.service.sendMail({
                to,
                subject: 'Vaš nalog je u privremenom tajmautu',
                html:
                    `<div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.5;">
                        <h2 style="color: #2c3e50;">Vaš nalog je u privremenom tajmautu</h2>
                        <p>Na osnovu prijava drugih igrača, administrator igre je odlučio da je Vaš nalog potrebno privremeno ukloniti iz igre.
                        Nalog će biti vraćen u upotrebu nakon isteka vremenskog tajmauta (${until}) ili ukoliko administrator donese takvu odluku, pre isteka istog.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 0.9em; color: #7f8c8d;">Ovo je automatski generisana poruka, molimo Vas da ne odgovarate direktno na ovaj email.</p>
                        <p>Pozdrav,<br><strong>Battleships</strong></p>
                    </div>`
            });
            console.log(result.accepted);
        }
        catch (error) {
            console.error(error);
        }
    }

    async mailReportFeedback(to: string) {
        try {
            await this.service.sendMail({
                to,
                subject: 'Vaša prijava drugog igrača je bila deo odluke',
                html:
                    `<div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.5;">
                        <h2 style="color: #2c3e50;">Vaša prijava drugog igrača je bila deo odluke</h2>
                        <p>Nakon sagledavanja Vaše prijave, administrator igre je doneo odluku o ograničavanju prijavljenog igrača.
                        Hvala na učestvovanju i srećno u daljim borbama!</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 0.9em; color: #7f8c8d;">Ovo je automatski generisana poruka, molimo Vas da ne odgovarate direktno na ovaj email.</p>
                        <p>Pozdrav,<br><strong>Battleships</strong></p>
                    </div>`
            });
        }
        catch (error) {
            console.error(error);
        }
    }
}