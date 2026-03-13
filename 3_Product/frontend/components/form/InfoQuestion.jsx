/**
 * InfoQuestion — Read-only informational block (no user input).
 *
 * Props:
 *   question: { description }
 */
export default function InfoQuestion({ question }) {
    return (
        <div className="p-4 bg-sand rounded-lg border-l-[3px] border-sage">
            <p className="text-[13px] text-warmGray m-0 leading-relaxed">{question.description}</p>
        </div>
    );
}
