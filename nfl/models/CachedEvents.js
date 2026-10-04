import mongoose from 'mongoose';

const CachedEventsSchema = new mongoose.Schema({
    key: { 
        type: String,
        required: true,
        unique: true
    },
    events: { type: Array }
}, { timestamps: true });

export default mongoose.models.CachedEvents || mongoose.model('CachedEvents', CachedEventsSchema);