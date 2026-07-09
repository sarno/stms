import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { join } from "path";
import qrcode from "qrcode-terminal";

const SESSION_DIR = join(process.cwd(), "storage", "sessions", "wa");

class WhatsAppService {
  private sock: any = null;
  private isReady = false;

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, console as any),
      },
      browser: ["STMS Server", "Chrome", "1.0.0"],
    });

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrcode.generate(qr, { small: true });
        console.log("📱 Scan QR Code di atas untuk menghubungkan WhatsApp.");
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("WA connection closed. Reconnecting:", shouldReconnect);
        this.isReady = false;
        if (shouldReconnect) {
          setTimeout(() => this.connect(), 5000);
        }
      } else if (connection === "open") {
        console.log("✅ WhatsApp terhubung.");
        this.isReady = true;
      }
    });
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.isReady || !this.sock) {
      console.warn("WhatsApp belum terhubung. Pesan tidak terkirim.");
      return false;
    }

    try {
      const jid = phoneNumber.replace(/\D/g, "") + "@s.whatsapp.net";
      await this.sock.sendMessage(jid, { text: message });
      console.log(`✉️  WA terkirim ke ${phoneNumber}`);
      return true;
    } catch (err) {
      console.error("Gagal kirim WA:", err);
      return false;
    }
  }

  getStatus() {
    return this.isReady;
  }
}

export const waService = new WhatsAppService();
