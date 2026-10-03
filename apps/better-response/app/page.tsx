import { ChatWindow } from "./chat-window";
import { CopyButton } from "./copy-button";
import { Mark } from "./mark";
import "./styles.css";

const INSTALL_PROMPT =
  "Install the Better Response plugin from the production branch of https://github.com/enkind/better-response";

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="inner">
          <a className="wordmark" href="/">
            <Mark />
            Better Response
          </a>
          <span className="pill">Early preview</span>
          <span className="spacer" />
          <a href="https://github.com/enkind/better-response">GitHub</a>
          <a className="action" href="#install">
            Add to your agent
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="inner">
          <h1>Some answers shouldn’t arrive as a wall of text.</h1>
          <p className="lede">
            Better Response is a free plugin for the agent you already use. When
            an answer would be easier to work through as an interface, your agent
            builds one and puts it in the conversation.
          </p>

          <div className="actions">
            <a className="action" href="#install">
              Add to your agent
            </a>
          </div>

          <ChatWindow />

          <p className="caption">
            The window is a mock of the client you already use. The panel inside
            it is not — it is rendered live by the same code your agent runs.
          </p>
        </div>
      </section>

      <section className="band">
        <div className="inner">
          <h2>Three steps, and you never leave the chat.</h2>

          <ol className="steps">
            <li>
              <div className="chat tile" aria-hidden="true">
                <div className="menu">
                  <span className="on">
                    <Mark className="solid" />
                    Better Response
                    <span className="state">Connected</span>
                  </span>
                  <span>
                    <svg viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="7" />
                      <path d="M3 10h14M10 3c2 2.2 2.8 4.6 2.8 7s-.8 4.8-2.8 7c-2-2.2-2.8-4.6-2.8-7S8 5.2 10 3z" />
                    </svg>
                    Web search
                  </span>
                </div>
                <div className="composer">
                  <span className="round">
                    <svg viewBox="0 0 20 20">
                      <path d="M10 4.5v11M4.5 10h11" />
                    </svg>
                  </span>
                  <span className="ask">Ask anything</span>
                </div>
              </div>
              <h3>Add it to your agent</h3>
              <p>
                Point your agent at one address. There is no account and no key,
                and it sits beside the tools your agent already has.
              </p>
            </li>

            <li>
              <div className="chat tile" aria-hidden="true">
                <span className="prior">
                  For pasta night you need 400 g spaghetti, 200 g guanciale, 4 eggs and pecorino.
                </span>
                <div className="menu">
                  <span className="on">
                    <Mark className="solid" />
                    <span className="skill">
                      <span className="state">Better Response:</span> Visualize
                    </span>
                  </span>
                </div>
                <div className="composer">
                  <span className="round">
                    <svg viewBox="0 0 20 20">
                      <path d="M10 4.5v11M4.5 10h11" />
                    </svg>
                  </span>
                  <span className="ask typed">/visualize</span>
                  <span className="round send">
                    <svg viewBox="0 0 20 20">
                      <path d="M10 15.5V5M5.5 9.5L10 5l4.5 4.5" />
                    </svg>
                  </span>
                </div>
              </div>
              <h3>
                Type <code className="mono">/visualize</code>
              </h3>
              <p>
                After your agent answers, type{" "}
                <code className="mono">/visualize</code> and pick Better
                Response: Visualize.
              </p>
            </li>

            <li>
              <div className="chat tile" aria-hidden="true">
                <span className="app">
                  <Mark className="solid" />
                  Better Response
                </span>
                <div className="sketch">
                  <strong>Pasta night</strong>
                  <span>
                    <span className="box on">
                      <svg viewBox="0 0 20 20">
                        <path d="M5 10.5l3.5 3.5L15 7" />
                      </svg>
                    </span>
                    400 g spaghetti
                  </span>
                  <span>
                    <span className="box" />
                    200 g guanciale
                  </span>
                  <span>
                    <span className="box" />4 eggs
                  </span>
                </div>
              </div>
              <h3>Use what it builds</h3>
              <p>
                Your agent turns what the conversation already holds into an
                interface, and it lands right in the thread.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="band" id="install">
        <div className="inner">
          <h2>Add it to your agent.</h2>
          <p className="lede">No account and no key.</p>

          <div className="ways">
            <article>
              <div className="head">
                <h3>Ask your agent to install it</h3>
                <span className="pill">
                  <span className="dot" />
                  Available now
                </span>
              </div>
              <p>Paste this into Codex or Cursor, then start a new chat.</p>
              <p className="address">
                <code className="mono">{INSTALL_PROMPT}</code>
                <CopyButton value={INSTALL_PROMPT} label="Copy" trackAs="install-copied" />
              </p>
            </article>

            <article>
              <div className="head">
                <h3>From your agent’s marketplace</h3>
                <span className="pill">Coming soon</span>
              </div>
              <p>
                Install it in one click from the plugin marketplace inside your
                agent.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer>
        <div className="inner">
          <p className="site-links">
            <a href="https://github.com/enkind/better-response">GitHub</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/support">Support</a>
          </p>
          <p className="colophon">
            Free and noncommercial. MIT licensed. Made by dzhunka.
          </p>
          <p className="mission">Tools for agents. Software for humans.</p>
        </div>
      </footer>
    </main>
  );
}
