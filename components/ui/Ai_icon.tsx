
import {React} from "react"
interface Ai_IconProp {
	className: string;
}
const Ai_icon: React.FC<Ai_IconProp> = ({ className = "20" }) => {
  return <img src="/ai.avif" className={className} alt="Ai_icon" />;
};

export default Ai_icon;