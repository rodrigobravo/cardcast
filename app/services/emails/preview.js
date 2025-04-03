import fs from 'fs'
import ReactDOMServer from 'react-dom/server'
import { ConfirmationEmail } from './templates/ConfirmationEmail'

const html = ReactDOMServer.renderToStaticMarkup(
  <ConfirmationEmail 
    username="TestUser" 
    verificationLink="https://cardcast.app/confirm?token=TEST123"
  />
)

fs.writeFileSync('./preview.html', html)
console.log('Preview gerado em preview.html')